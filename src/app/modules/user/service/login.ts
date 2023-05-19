import { Config, Inject, Provide } from '@midwayjs/decorator';
import {
  BaseService,
  CoolCommException,
  CoolEventManager,
} from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { UserInfoEntity } from '../entity/info';
import * as jwt from 'jsonwebtoken';
import { UserWechatService } from './wechat';
import axios from 'axios';
import * as moment from 'moment';
import { v1 as uuid } from 'uuid';
import * as crypto from 'crypto';

/**
 * 登录
 */
@Provide()
export class UserLoginService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Config('module.user')
  config;

  @Inject()
  userWechatService: UserWechatService;

  @Inject('cool:coolEventManager')
  coolEventManager: CoolEventManager;

  /**
   * 微信开发平台登录(app登录)
   * @param code
   */
  async wxOpenLogin(code) {
    return await this.wxLogin(
      await this.userWechatService.openUserInfo(code),
      'open'
    );
  }

  /**
   * 微信公众号登录
   * @param code
   */
  async wxMpLogin(code) {
    return await this.wxLogin(
      await this.userWechatService.mpUserInfo(code),
      'mp'
    );
  }

  /**
   * 微信小程序登录
   * @param code
   * @param encryptedData
   * @param iv
   */
  async wxMiniLogin(code, encryptedData, iv) {
    return await this.wxLogin(
      await this.userWechatService.miniUserInfo(code, encryptedData, iv),
      'mini'
    );
  }

  /**
   * 微信登录后的通用操作
   * @param wxUser
   * @param source 来源
   */
  async wxLogin(wxUser, source = 'mp') {
    const check = await this.userInfoEntity.findOne({
      wxId: wxUser.unionid ? wxUser.unionid : wxUser.openid,
    });
    switch (source) {
      // 小程序
      case 'mini':
        wxUser['miniOpenid'] = wxUser.openid;
        wxUser['source'] = 2;
        break;
      // 公众号
      case 'mp':
        wxUser['mpOpenid'] = wxUser.openid;
        wxUser['source'] = 1;
        break;
      // APP
      case 'open':
        wxUser['source'] = 0;
        wxUser['openOpenid'] = wxUser.openid;
        break;
      // h5
      case 'h5':
        wxUser['source'] = 3;
        break;
    }

    if (!check) {
      const users = new UserInfoEntity();
      // wxUser.headimgurl += '.png';
      wxUser['wxId'] = wxUser.unionid ? wxUser.unionid : wxUser.openid;

      Object.assign(users, wxUser);
      await this.userInfoEntity.insert(users);
      // 发送事件通知 该用户为新人
      this.coolEventManager.emit('newUser', users);
    } else {
      if (check && check.status == 1) {
        await this.userInfoEntity.update(
          { id: check.id },
          {
            source: wxUser.source,
            sex: wxUser.sex,
            nickname: wxUser.nickname,
            openOpenid: wxUser?.openOpenid,
            mpOpenid: wxUser?.mpOpenid,
            miniOpenid: wxUser?.miniOpenid,
            headimgurl: wxUser.headimgurl,
          }
        );
      } else {
        throw new CoolCommException('用户状态封禁');
      }
    }

    const userInfo = await this.userInfoEntity.findOne({
      wxId: wxUser.unionid ? wxUser.unionid : wxUser.openid,
    });
    return await this.token(userInfo);
  }

  /**
   * 获得用户token
   * @param userInfo
   */
  async token(userInfo) {
    const accessToken = await this.generateToken(userInfo); // token  2小时过期
    const refreshToken = await this.generateToken(userInfo, 'refresh'); // 刷新token 不可用于请求 只能用于换取新的token 360天过期
    return {
      accessToken,
      accessTokenExpires: this.config.token.expiresIn.access,
      refreshToken,
      refreshTokenExpires: this.config.token.expiresIn.refresh,
      userInfo,
    };
  }

  /**
   * 刷新token
   * @param refreshToken
   */
  async refreshToken(refreshToken) {
    try {
      const appUser = jwt.verify(refreshToken, this.config.token.secret);
      if (appUser['type'] != 'refresh') {
        throw new CoolCommException('token类型非refreshToken');
      }
      const userInfo = await this.userInfoEntity.findOne({
        id: appUser['id'],
      });
      return this.token(userInfo);
    } catch (e) {
      throw new CoolCommException(
        '刷新token失败，请检查refreshToken是否正确或过期'
      );
    }
  }

  /**
   * 生成token
   * @param user 用户对象
   * @param type 类型 access refresh
   */
  async generateToken(userInfo, type = 'access') {
    const tokenInfo = {
      type,
      id: userInfo.id,
      openid: userInfo.openid,
    };
    return jwt.sign(tokenInfo, this.config.token.secret, {
      expiresIn: this.config.token.expiresIn[type],
    });
  }
  /**
   * 获得微信配置
   * @param appId
   * @param appSecret
   * @param url 当前网页的URL，不包含#及其后面部分(必须是调用JS接口页面的完整URL)
   */
  public async getWxMpConfig(url: string) {
    const access_token = await this.getWxToken();
    const ticket = await axios.get(
      'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
      {
        params: {
          access_token: access_token.data.access_token,
          type: 'jsapi',
        },
      }
    );
    const { appid } = this.config.wx.mp;
    // 返回结果集
    const result = {
      timestamp: parseInt(moment().valueOf() / 1000 + ''),
      nonceStr: uuid(),
      appId: appid, //appid
      signature: '',
    };
    const signArr = [];
    signArr.push('jsapi_ticket=' + ticket.data.ticket);
    signArr.push('noncestr=' + result.nonceStr);
    signArr.push('timestamp=' + result.timestamp);
    signArr.push('url=' + decodeURI(url));
    // 敏感信息加密处理
    result.signature = crypto
      .createHash('sha1')
      .update(signArr.join('&'))
      .digest('hex')
      .toUpperCase();
    return result;
  }

  /**
   * 获得微信token
   * @returns
   */
  async getWxToken() {
    const { appId, secret } = this.config;
    const token = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: {
        grant_type: 'client_credential', //获得access_token直接填写client_credential
        appid: appId, // appid
        secret: secret, //secret
      },
    });
    return token;
  }
}

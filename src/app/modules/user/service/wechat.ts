import { Config, Provide, Inject } from '@midwayjs/decorator';
import {
  BaseService,
  CoolCommException,
  CoolEventManager,
} from '@cool-midway/core';
import axios from 'axios';
import { v1 as uuid } from 'uuid';
import * as crypto from 'crypto';
import * as WechatAPI from 'co-wechat-api';
import { InjectEntityModel } from '@midwayjs/orm';
import { BaseSysUserEntity } from '../../base/entity/sys/user';
import { Repository } from 'typeorm';

/**
 * 微信
 */
@Provide()
export class UserWechatService extends BaseService {
  @Config('module.user')
  config;

  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;

  @Inject('cool:coolEventManager')
  coolEventManager: CoolEventManager;
  /**
   * 获得公众号用户信息
   * @param code
   */
  async mpUserInfo(code) {
    const token = await this.openOrMpToken(code, this.config.wx.mp);
    return await this.openOrMpUserInfo(token);
  }

  /**
   * 获得开放平台用户信息
   * @param code
   */
  async openUserInfo(code) {
    const token = await this.openOrMpToken(code, this.config.wx.open);
    if (token.errcode) {
      throw new CoolCommException('code已过期~');
    }
    return await this.openOrMpUserInfo(token);
  }

  /**
   * 获得小程序用户信息
   * @param code
   * @param encryptedData
   * @param iv
   */
  async miniUserInfo(code, encryptedData, iv) {
    const session = await this.miniSession(code, this.config.wx.mini);
    if (session.errcode) {
      throw new CoolCommException('登录失败，请重试');
    }
    const info = await this.miniDecryptData(
      encryptedData,
      iv,
      session.session_key
    );
    if (info) {
      delete info['watermark'];
      return {
        openid: session['openid'],
        nickname: info['nickName'],
        sex: info['gender'],
        city: info['city'],
        province: info['province'],
        country: info['country'],
        headimgurl: info['avatarUrl'],
        unionid: session['unionid'],
        wxMiniOpenid: info['openid'],
      };
    }
    return null;
  }

  /**
   * 获得小程序手机
   * @param code
   * @param encryptedData
   * @param iv
   */
  async miniPhone(code, encryptedData, iv) {
    const session = await this.miniSession(code, this.config.wx.mini);
    if (session.errcode) {
      throw new CoolCommException('获取手机号失败，请刷新重试');
    }
    return await this.miniDecryptData(encryptedData, iv, session.session_key);
  }

  /**
   * 小程序信息解密
   * @param encryptedData
   * @param iv
   * @param sessionKey
   */
  async miniDecryptData(encryptedData, iv, sessionKey) {
    sessionKey = Buffer.from(sessionKey, 'base64');
    encryptedData = Buffer.from(encryptedData, 'base64');
    iv = Buffer.from(iv, 'base64');
    try {
      // 解密
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      // @ts-ignore
      let decoded = decipher.update(encryptedData, 'binary', 'utf8');
      // @ts-ignore
      decoded += decipher.final('utf8');
      // @ts-ignore
      decoded = JSON.parse(decoded);
      return decoded;
    } catch (err) {
      throw new CoolCommException('获得信息失败');
    }
  }

  /**
   * 获得小程序session
   * @param code 微信code
   * @param conf 配置
   */
  async miniSession(code, conf) {
    const result = await axios.get(
      'https://api.weixin.qq.com/sns/jscode2session',
      {
        params: {
          appid: conf.appid,
          secret: conf.appsecret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      }
    );

    return result.data;
  }

  /**
   * 获得token嗯
   * @param code
   * @param conf
   */
  async openOrMpToken(code, conf) {
    const result = await axios.get(
      'https://api.weixin.qq.com/sns/oauth2/access_token',
      {
        params: {
          appid: conf.appid,
          secret: conf.appsecret,
          code,
          grant_type: 'authorization_code',
        },
      }
    );
    return result.data;
  }

  /**
   * 获得微信token 不用code
   * @param appid
   * @param secret
   */
  public async getWxToken(type = 'mp') {
    //@ts-ignore
    // const value = await this.service.sys.conf.getLabel(type);
    //@ts-ignore
    const conf = this.config.wx[type];
    return await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: {
        grant_type: 'client_credential',
        appid: conf.appid,
        secret: conf.appsecret,
      },
    });
  }

  /**
   * 获得用户信息
   * @param token
   */
  async openOrMpUserInfo(token) {
    return await axios
      .get('https://api.weixin.qq.com/sns/userinfo', {
        params: {
          access_token: token.access_token,
          openid: token.openid,
          lang: 'zh_CN',
        },
      })
      .then(res => {
        return res.data;
      });
  }

  /**
   * 获得微信二维码
   */
  async qrcode() {
    const sceneId = uuid();
    const wxApi = await this.api();
    const ticketData = await wxApi.createTmpQRCode(sceneId, 900);
    const url = wxApi.showQRCodeURL(ticketData.ticket);
    return { url, sceneId };
  }

  async wxMessage(message) {
    if (message.Event === 'SCAN' || message.Event === 'subscribe') {
      const openid = await message.FromUserName;
      const wxApi = await this.api();
      const userInfo = await wxApi.getUser({
        openid,
        lang: 'zh_CN',
      });
      //根据场景id查询后台用户
      const admin = await this.baseSysUserEntity.findOne({
        sceneId: message.EventKey,
      });
      if (admin) {
        // 修改用户的openid
        this.baseSysUserEntity.update(
          { id: admin.id },
          { openid: userInfo.openid, wxNickName: userInfo.nickname }
        );
        // 发送消息让socket通知后台用户
        this.coolEventManager.emit('updateAdmin', { id: admin.id, type: 0 });
        // this.coolEventManager.emit('updateAdmin', admin.id);
      }
      return '登录成功 ！';
    } else {
      return '咨询';
    }
  }

  /**
   * 推送公众号消息
   * @param openid
   * @param templateId
   * @param data
   * @param conf
   */
  async sendMpMsg(openid, templateId, data, conf?) {
    const params = {
      template_id: templateId,
      data,
      touser: openid,
      ...conf,
    };
    const access_token = await this.getWxToken();
    await axios.post(
      `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token.data.access_token}`,
      params
    );
  }

  /**
   * 微信操作api
   */
  async api() {
    const { appid, appsecret } = this.config.wx.mp;
    return new WechatAPI(appid, appsecret);
  }
}

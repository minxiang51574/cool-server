import { Provide, Config } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import axios from 'axios';

const openHost = 'https://api.weixin.qq.com';

/**
 * 描述
 */
@Provide()
export class ConfWeChatService extends BaseService {
  @Config('module.conf')
  config;

  /**
   * 创建更新菜单
   * @param data
   */
  public async createMpMenu(button) {
    const access_token = await this.getWxToken();
    const resut = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${access_token.data.access_token}`,
      button
    );
    if (resut.data.errcode != 0) {
      throw new Error(
        '创建更新菜单失败' + resut.data.errcode + JSON.stringify(resut.data)
      );
    }
  }

  /**
   * 查询菜单
   */
  public async findMpMenu() {
    const access_token = await this.getWxToken();
    const resut = await axios.get(
      `${openHost}/cgi-bin/menu/get?access_token=${access_token.data.access_token}`
    );
    return resut.data.menu;
  }

  /**
   * 清空菜单
   */
  public async clearMpMenu() {
    const access_token = await this.getWxToken();
    const resut = await axios.get(
      `${openHost}/cgi-bin/menu/delete?access_token=${access_token.data.access_token}`
    );
    if (resut.data.errcode != 0) {
      throw new Error('清空菜单失败' + JSON.stringify(resut.data));
    }
  }

  /**
   * 获得微信token 不用code
   * @param appid
   * @param secret
   */
  public async getWxToken(type = 'mp') {
    // @ts-ignore
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
}

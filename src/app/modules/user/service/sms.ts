import { Provide, Config, Inject } from '@midwayjs/decorator';
import { BaseService, ICoolCache, CoolCommException } from '@cool-midway/core';
import * as _ from 'lodash';
import * as Core from '@alicloud/pop-core';
import { UserInfoEntity } from '../entity/info';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { UserLoginService } from './login';

/**
 * 描述
 */
@Provide()
export class UserSmsService extends BaseService {
  // 获得模块的配置信息
  @Config('module.user.sms')
  config;

  @Inject('cool:cache')
  coolCache: ICoolCache;

  @Inject()
  userLoginService: UserLoginService;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  /**
   * 发送验证码
   * @param phone
   */
  async sendSms(phone) {
    const TemplateParam = { code: _.random(1000, 9999) };
    await this.send(phone, TemplateParam);
    this.coolCache.set(`sms:${phone}`, TemplateParam.code, 60 * 3);
  }

  /**
   * 手机号登录
   * @param query
   * @returns
   */
  async phoneLogin(phone, code) {
    // 获得缓存的验证码
    const templateCode = await this.coolCache.get(`sms:${phone}`);
    if (code == templateCode) {
      let userInfo = await this.userInfoEntity.findOne({ phone });
      if (!userInfo) {
        //执行增加用户
        const user = await this.userInfoEntity.insert({
          nickname: phone.substring(7, 11),
          source: 3,
          phone,
        });
        userInfo = await this.userInfoEntity.findOne(user.generatedMaps[0].id);
      }

      return this.userLoginService.token(userInfo);
    } else {
      throw new CoolCommException('验证码错误~');
    }
  }

  /**
   * 发送短信
   * @param phone
   * @param templateCode
   * @param template
   */
  async send(phone, TemplateParam) {
    const { signName, accessKeyId, accessKeySecret, templateCode } =
      this.config;
    const client = new Core({
      accessKeyId,
      accessKeySecret,
      endpoint: 'https://dysmsapi.aliyuncs.com',
      // endpoint: 'https://cs.cn-hangzhou.aliyuncs.com',
      apiVersion: '2017-05-25',
      // apiVersion: '2018-04-18',
    });
    const params = {
      RegionId: 'cn-shanghai',
      PhoneNumbers: phone,
      signName,
      templateCode,
      TemplateParam: JSON.stringify(TemplateParam),
    };
    return await client.request('SendSms', params, {
      method: 'POST',
    });
  }
}

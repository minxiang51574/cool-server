import { Inject, Provide, Scope, ScopeEnum, Config } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { CoolEvent, Event, BaseService } from '@cool-midway/core';
import { Repository } from 'typeorm';
import { BaseSysUserEntity } from '../../base/entity/sys/user';
import { UserWechatService } from '../service/wechat';
import * as moment from 'moment';

/**
 * 接收事件
 */
@Provide()
@Scope(ScopeEnum.Singleton)
@CoolEvent()
export class UserEvent extends BaseService {
  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;
  @Inject()
  userWechatService: UserWechatService;

  @Config('module.user.wx.mp')
  config;

  @Event('pushAdmin')
  async pushAdmin(param) {
    // 查询后台用户
    const admin = await this.baseSysUserEntity.findOne({ id: param.adminId });
    if (admin.isPush == 1 && admin.openid != null) {
      // 向用户推送消息
      const msgType = this.getMsgType(param.contentType);
      await this.userWechatService.sendMpMsg(
        admin.openid,
        this.config.msgNotify,
        {
          first: {
            value: 'cool-uni 用户信息推送',
          },
          user: {
            value: ` ${param.fromName}`,
          },

          ask: {
            value: msgType == '文本' ? JSON.parse(param.content).text : msgType,
          },
          remark: {
            value: `时间：${moment().format('YYYY-MM-DD HH:mm:ss')}`,
          },
        },
        {
          url: this.config.sessionUrl[this.app.getEnv()],
        }
      );
    }
  }
  /**
   * 获得类型
   * @param type
   * @returns
   */
  getMsgType(type) {
    switch (type) {
      case 0:
        return '文本';
      case 1:
        return '图片';
      case 2:
        return '表情';
      case 3:
        return '语音';
      case 4:
        return '视频';
      default:
        '文本';
    }
  }
}

import { Inject, Provide } from '@midwayjs/decorator';
import {
  BaseService,
  CoolEventManager,
  CoolCommException,
} from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { UserInfoEntity } from '../entity/info';
import { UserWechatService } from './wechat';

/**
 * 用户
 */
@Provide()
export class UserInfoService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Inject()
  userWechatService: UserWechatService;

  @Inject('cool:coolEventManager')
  coolEventManager: CoolEventManager;

  /**
   * 绑定socketId
   * @param socketId
   * @param userId
   */
  async bindSocketId(socketId, userId) {
    await this.userInfoEntity
      .createQueryBuilder()
      .update()
      .set({ socketId })
      .where('id =:userId', { userId })
      .execute();
  }

  /**
   * 个人信息
   */
  async personal(userId) {
    return await this.userInfoEntity.findOne({ id: userId });
  }

  /**
   * 修改之后
   * @param params
   */
  async modifyAfter(params) {
    if (params.id) {
      this.coolEventManager.emit('updateUser', params, 1);
    }
  }

  /**
   * 绑定手机
   * @param code
   * @param encryptedData
   * @param iv
   * @param userId
   */
  async bindMiniPhone(code, encryptedData, iv, userId) {
    const phoneInfo = await this.userWechatService.miniPhone(
      code,
      encryptedData,
      iv
    );
    const user = await this.userInfoEntity.findOne({
      phone: phoneInfo['phoneNumber'],
    });
    if (user) {
      throw new CoolCommException('该手机号已被绑定');
    }
    await this.userInfoEntity
      .createQueryBuilder()
      .update()
      .set({ phone: phoneInfo['phoneNumber'] })
      .where('id=:id', { id: userId })
      .execute();
    return phoneInfo['phoneNumber'];
  }
}

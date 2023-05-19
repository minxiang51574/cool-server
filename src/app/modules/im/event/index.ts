import { Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { CoolEvent, Event } from '@cool-midway/core';
import { ImUserEntity } from '../entity/user';
import { Repository } from 'typeorm';
import { ImSocketEvent } from '../socket/event';

/**
 * 接收事件
 */
@Provide()
@Scope(ScopeEnum.Singleton)
@CoolEvent()
export class ImEvent {
  @InjectEntityModel(ImUserEntity)
  imUserEntity: Repository<ImUserEntity>;
  @Inject()
  imSocketEvent: ImSocketEvent;

  @Event('updateUser')
  async updateUser(param, type) {
    await this.imUserEntity.update(
      { id: param.id },
      { headimg: param.headimg, nickname: param.nickname }
    );
  }
  @Event('updateAdmin')
  async updateAdmin(param) {
    const user = await this.imUserEntity.findOne({
      userId: param.id,
      type: param.type,
    });
    await this.imSocketEvent.send(
      user.socketId,
      JSON.stringify({ action: 2, data: '修改成功' })
    );
  }
}

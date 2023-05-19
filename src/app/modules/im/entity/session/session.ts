import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 会话
 */
@EntityModel('im_session_info')
export class ImSessionInfoEntity extends BaseEntity {
  @Index()
  @Column({ comment: '最后一条消息', nullable: true, type: 'bigint' })
  lastContentId: number;

  @Column({
    comment: '会话类型 0：单聊 1：群聊',
    default: 0,
    type: 'tinyint',
  })
  type: number;

  @Column({ comment: '状态，0 正常，1删除' })
  status: number;
}

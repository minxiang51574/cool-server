import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 用户消息
 */
@EntityModel('im_message_user')
export class ImMessageUserEntity extends BaseEntity {
  @Index()
  @Column({ comment: '会话ID', type: 'bigint' })
  sessionId: number;

  @Column({ comment: '用户ID', type: 'bigint' })
  userId: string;

  @Column({ comment: '消息ID', type: 'bigint' })
  messageId: number;

  @Column({ comment: '状态 0：未读 1：已读', type: 'tinyint', default: 0 })
  status: number;
}

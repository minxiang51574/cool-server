import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 会话用户
 */
@Index(['room', 'sessionId', 'userId', 'objectType'])
@EntityModel('im_session_user')
export class ImSessionUserEntity extends BaseEntity {
  @Index()
  @Column({ comment: '房间' })
  room: string;

  @Index()
  @Column({ comment: '会话ID', type: 'bigint' })
  sessionId: number;

  @Index()
  @Column({ comment: '用户ID' })
  userId: string;

  @Column({ comment: '排序', default: 0 })
  orderNum: number;

  @Column({ comment: '是否置顶 0：否 1：是', default: 0 })
  isTop: number;

  @Column({ comment: '是否删除 0：否 1：是', type: 'tinyint', default: 0 })
  isDelete: number;

  @Column({ comment: '名称' })
  name: string;

  @Column({ comment: '未读消息数', type: 'int', default: 0 })
  unreadCount: number;

  @Column({
    comment: '对象类型 0:后台，1:用户',
    default: 0,
  })
  objectType: number;
}

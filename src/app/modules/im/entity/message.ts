import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 描述
 */
@EntityModel('im_message')
export class ImMessageEntity extends BaseEntity {
  @Index()
  @Column({ comment: '会话ID', type: 'bigint' })
  sessionId: number;

  @Index()
  @Column({ comment: '发送者' })
  fromId: string;

  @Index()
  @Column({ comment: '房间' })
  room: string;

  @Index()
  @Column({
    comment: '对象类型 0:后台 1:用户 2:游客',
    type: 'tinyint',
    default: 0,
  })
  objectType: number;

  @Column({
    comment: '消息类型 0:文本 1：图片 2：表情 3:语音 4：视频',
    type: 'tinyint',
    default: 0,
  })
  contentType: number;

  @Column({ comment: '内容', type: 'text' })
  content: string;

  @Column({ comment: '消息类型 0：单聊 1：群聊', type: 'tinyint' })
  type: number;

  @Column({ comment: '用户id' })
  userId: number;
}

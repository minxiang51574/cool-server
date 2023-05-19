import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 聊天用户
 */
@Index(['userId', 'type'], { unique: true })
@EntityModel('im_user')
export class ImUserEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: string;

  @Column({ comment: '昵称', nullable: true })
  nickname: string;

  @Column({ comment: '头像', nullable: true })
  headimg: string;

  @Column({ comment: 'socketId' })
  socketId: string;

  @Column({
    comment: '类型 0:后台 1:用户 2:游客|临时用户',
    type: 'tinyint',
    default: 0,
  })
  type: number;
}

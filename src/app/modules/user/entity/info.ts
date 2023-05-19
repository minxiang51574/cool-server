import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 用户信息
 */
@EntityModel('user_info')
export class UserInfoEntity extends BaseEntity {
  @Column({ comment: '昵称' })
  nickname: string;

  @Column({ comment: '头像', nullable: true })
  headimgurl: string;

  @Index()
  @Column({ nullable: true })
  phone: string;

  @Column({ comment: '性别  0：未知 1：男 2：女', type: 'tinyint', default: 0 })
  sex: number;

  @Index()
  @Column({
    comment: '微信ID，如果有配置微信开放平台则为unionid，没有则为openid',
    nullable: true,
  })
  wxId: string;

  @Column({ comment: '小程序openid', nullable: true })
  miniOpenid: string;

  @Column({ comment: '公众号openid', nullable: true })
  mpOpenid: string;

  @Column({ comment: 'app openid', nullable: true })
  openOpenid: string;

  @Column({ comment: '翼支付 openid', nullable: true })
  yzfOpenid: string;

  @Column({ comment: '状态 0: 禁用  1： 启用', type: 'tinyint', default: 1 })
  status: number;

  @Column({ comment: 'socketId，即时通讯用的', nullable: true })
  socketId: string;

  @Column({
    comment: '来源 0: APP 1: 公众号 2: 小程序 3: H5',
    type: 'tinyint',
    default: 0,
  })
  source: number;

  @Column({ comment: '标签，多个标签按“,”隔开', nullable: true })
  labels: string;
}

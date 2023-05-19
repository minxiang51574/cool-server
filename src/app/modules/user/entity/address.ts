import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 地址
 */
@EntityModel('user_address')
export class UserAddressEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID', type: 'bigint' })
  userId: number;

  @Column({ comment: '省份' })
  province: string;

  @Column({ comment: '城市' })
  city: string;

  @Column({ comment: '区' })
  country: string;

  @Column({ comment: '详细地址' })
  detail: string;

  @Column({ comment: '联系人' })
  contact: string;

  @Column({ comment: '手机号码' })
  phone: string;

  @Column({ comment: '是否默认', default: false })
  isDefault: boolean;
}

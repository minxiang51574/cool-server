import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column } from 'typeorm';

/**
 * 描述
 */
@EntityModel('market_cuopons_user')
export class MarketCouponsUserEntity extends BaseEntity {
  @Column({ comment: '优惠券id' })
  couponsId: number;

  @Column({ comment: '用户id' })
  userId: number;

  @Column({ comment: '状态 0 不可用 1可用 2 已用 3 已过期 ', default: 1 })
  status: number;
}

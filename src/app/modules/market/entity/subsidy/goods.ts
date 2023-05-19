import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column } from 'typeorm';

/**
 * 商品
 */
@EntityModel('market_subsidy_goods')
export class MarketSubsidyGoodsEntity extends BaseEntity {
  @Column({
    comment: '补贴金额',
    type: 'decimal',
    scale: 2,
    precision: 10,
    nullable: true,
  })
  subsidyMoney: number;

  @Column({ comment: '商品ID', type: 'bigint' })
  goodsId: number;

  @Column({ comment: '活动ID' })
  activityId: number;
}

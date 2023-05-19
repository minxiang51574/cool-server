import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column } from 'typeorm';

/**
 * 补贴
 */
@EntityModel('market_subsidy_conf')
export class MarketSubsidyConfEntity extends BaseEntity {
  @Column({
    comment: '补贴金额',
    type: 'decimal',
    scale: 2,
    precision: 10,
  })
  money: number;

  @Column({ comment: '活动ID' })
  activityId: number;
}

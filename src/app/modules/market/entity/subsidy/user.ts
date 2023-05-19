import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column } from 'typeorm';

/**
 * 补贴用户
 */
@EntityModel('market_subsidy_user')
export class MarketSubsidyUserEntity extends BaseEntity {
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '活动ID' })
  activityId: number;

  @Column({
    comment: '补贴金额',
    type: 'decimal',
    scale: 2,
    precision: 10,
    nullable: true,
  })
  money: number;

  @Column({
    comment: '剩下金额',
    type: 'decimal',
    scale: 2,
    precision: 10,
    nullable: true,
    default: 0.0,
  })
  remain: number;

  @Column({ comment: '结束时间' })
  endTime: Date;
}

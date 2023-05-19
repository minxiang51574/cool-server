import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column } from 'typeorm';

/**
 * 描述
 */
@EntityModel('market_coupons_info')
export class MarketCouponsInfoEntity extends BaseEntity {
  @Column({ comment: '名称' })
  name: string;

  @Column({ comment: '方式 0 手动领取 1 新人券 2 赠送券 3 会员券' })
  way: number;

  @Column({ comment: '类型 0 通用券 1 品类券 2 商品券 ' })
  type: number;

  @Column({ comment: '优惠券类型内幕 ', nullable: true })
  insider: string;

  @Column({
    comment: '优惠券金额',
    type: 'decimal',
    scale: 2,
    precision: 10,
    nullable: true,
    default: 0.0,
  })
  couponsPrice: number;

  @Column({ comment: '门槛 0 无门槛 1 有门槛' })
  threshold: number;

  @Column({
    comment: '门槛金额',
    type: 'decimal',
    scale: 2,
    precision: 10,
    nullable: true,
    default: 0.0,
  })
  thresholdPrice: number;

  @Column({ comment: '使用时间 0 天数 1 时间段' })
  timeType: number;

  @Column({ comment: '天数', nullable: true })
  useDay: number;

  @Column({ comment: '开始时间', nullable: true })
  startTime: Date;

  @Column({ comment: '结束时间', nullable: true })
  endTime: Date;

  @Column({ comment: '领取时间 0 限时 1 不限时 ' })
  getTime: number;

  @Column({ comment: '领取开始时间值', nullable: true })
  getStartTimeData: Date;

  @Column({ comment: '领取结束时间值', nullable: true })
  getEndTimeData: Date;

  @Column({ comment: '是否限量' })
  isLimited: number;

  @Column({ comment: '限量数量', nullable: true })
  limitedNum: number;

  @Column({ comment: '领取数量', default: 0 })
  getNum: number;

  @Column({ comment: '是否开启' })
  open: number;
}

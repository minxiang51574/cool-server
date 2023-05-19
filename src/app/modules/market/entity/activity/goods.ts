import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column } from 'typeorm';

/**
 * 商品
 */
@EntityModel('market_activity_goods')
export class MarketActivityGoodsEntity extends BaseEntity {
  @Column({ comment: '商品ID', type: 'bigint' })
  goodsId: number;

  @Column({ comment: '活动ID', type: 'bigint' })
  activityId: number;

  @Column({ comment: '活动类型', type: 'tinyint', default: 0 })
  activityType: number;

  @Column({ type: 'tinyint', comment: '状态：0：禁用 1：启用', default: 1 })
  status: number;

  @Column({ comment: '限制数量', nullable: true })
  limitCount: number;

  @Column({ comment: '用户限制数量', nullable: true })
  userLimitCount: number;

  @Column({ comment: '排序', type: 'int', default: 0 })
  sortNum: number;

  @Column({ comment: '已售数量', type: 'int', default: 0 })
  salesCount: number;

  // @Column({ comment: '原商品信息', type: 'text', nullable: true })
  // originalGoods: string;
}

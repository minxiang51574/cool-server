import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column } from 'typeorm';

/**
 * 活动信息
 */
@EntityModel('market_activity_info')
export class MarketActivityInfoEntity extends BaseEntity {
  @Column({ comment: '活动标题' })
  title: string;

  @Column({ comment: '副标题' })
  subTitle: string;

  @Column({ comment: '图片', nullable: true })
  pic: string;

  @Column({ comment: '详情页', nullable: true })
  detailPage: string;

  @Column({ comment: '开始时间' })
  startTime: Date;

  @Column({ comment: '结束时间' })
  endTime: Date;

  @Column({ type: 'tinyint', comment: '状态：0：禁用 1：启用', default: 1 })
  status: number;

  @Column({ type: 'tinyint', comment: '类型：0：补贴 ', default: 0 })
  type: number;
}

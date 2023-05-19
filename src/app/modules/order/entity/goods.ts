import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 订单商品
 */
@EntityModel('order_goods')
export class OrderGoodsEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID', type: 'bigint' })
  userId: number;

  @Index()
  @Column({ comment: '订单ID', type: 'bigint' })
  orderId: number;

  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '副标题', nullable: true })
  subTitle: string;

  @Column({ comment: '商品ID' })
  goodsId: number;

  @Column({ comment: '主图' })
  pic: string;

  @Column({ comment: '数量', type: 'int', default: 1 })
  goodsCount: number;

  @Column({ comment: '价格', type: 'decimal', scale: 2, precision: 10 })
  price: number;

  @Column({ comment: '规格' })
  specs: string;

  @Column({ comment: '状态', nullable: true })
  remark: string;

  @Column({
    comment: '状态：0：正常 1：退款中 2：已退款 3：拒绝',
    type: 'tinyint',
    default: 0,
  })
  status: number;

  @Column({
    comment: '优惠金额',
    type: 'decimal',
    scale: 2,
    precision: 10,
    default: 0,
  })
  discountPrice: number;

  @Column({ comment: '退款申请时间', type: 'datetime', nullable: true })
  refundApplyTime: Date;

  @Column({ comment: '退款时间', type: 'datetime', nullable: true })
  refundTime: Date;

  @Column({ comment: '退款原因', nullable: true })
  refundReason: string;

  @Column({ comment: '退款拒绝原因', nullable: true })
  refundRejectReason: string;

  @Column({ comment: '退款截图', type: 'text', nullable: true })
  refundPics: string;

  @Column({
    comment: '退款金额',
    type: 'decimal',
    scale: 2,
    precision: 10,
    nullable: true,
  })
  refundAmount: number;

  @Column({ comment: '活动ID', type: 'bigint', nullable: true })
  activityId: number;

  @Column({
    type: 'tinyint',
    comment: '类型：0：补贴 ',
    nullable: true,
  })
  activityType: number;
}

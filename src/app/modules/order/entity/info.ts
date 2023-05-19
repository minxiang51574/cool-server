import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 订单
 */
@EntityModel('order_info')
export class OrderInfoEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID', type: 'bigint' })
  userId: number;

  @Column({
    comment: '支付方式 0：微信 1：支付宝',
    type: 'tinyint',
    nullable: true,
  })
  payType: number;

  @Column({
    comment:
      '状态 0：待付款 1：待发货 2：待收货 3：待评价 4：交易完成 5: 已关闭',
    type: 'tinyint',
    default: 0,
  })
  status: number;

  @Column({
    comment: '价格',
    type: 'decimal',
    scale: 2,
    precision: 10,
    nullable: true,
  })
  price: number;

  @Column({
    comment: '优惠金额',
    type: 'decimal',
    scale: 2,
    precision: 10,
    default: 0,
  })
  discountPrice: number;

  @Column({ comment: '备注', nullable: true })
  remark: string;

  @Column({ comment: '省份' })
  province: string;

  @Column({ comment: '城市' })
  city: string;

  @Column({ comment: '区' })
  country: string;

  @Column({ comment: '详细地址' })
  detail: string;

  @Column({ comment: '手机' })
  phone: string;

  @Column({ comment: '联系人' })
  contact: string;

  @Column({ comment: '订单号' })
  orderNum: string;

  @Column({ comment: '物流单号', nullable: true })
  logisticsOrderNum: string;

  @Column({ comment: '物流名称', nullable: true })
  logisticsName: string;

  @Column({ comment: '取消原因', nullable: true })
  cancelReason: string;

  @Column({ comment: '优惠券id', nullable: true })
  couponsId: number;
}

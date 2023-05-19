import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 商品评论
 */
@EntityModel('goods_comment')
export class GoodsCommentEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID', type: 'bigint' })
  userId: number;

  @Index()
  @Column({ comment: '商品ID', type: 'bigint' })
  goodsId: number;

  @Index()
  @Column({ comment: '订单ID', type: 'bigint' })
  orderId: number;

  @Column({ comment: '评论内容' })
  content: string;

  @Column({ comment: '星数', default: 5 })
  starCount: number;

  @Column({
    comment: '图片，多个图片按“,”号隔开',
    type: 'text',
    nullable: true,
  })
  pics: string;
}

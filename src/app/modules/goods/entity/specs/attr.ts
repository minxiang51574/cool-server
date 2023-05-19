import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column } from 'typeorm';

/**
 * 商品属性
 */
@EntityModel('goods_specs_attr')
export class GoodsSpecsAttrEntity extends BaseEntity {
  @Column({ comment: '商品ID', type: 'bigint' })
  goodsId: number;

  @Column({ comment: '属性名' })
  name: string;

  @Column({ comment: '商品属性', type: 'text' })
  sku: string;
}

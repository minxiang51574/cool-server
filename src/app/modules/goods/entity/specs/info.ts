import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column } from 'typeorm';

/**
 * 商品规格
 */
@EntityModel('goods_specs_info')
export class GoodsSpecsInfoEntity extends BaseEntity {
  @Column({ comment: '商品ID', type: 'bigint' })
  goodsId: number;

  @Column({ comment: '规格KEY' })
  keyId: string;

  @Column({ comment: '名称', type: 'text' })
  name: string;

  @Column({ comment: '库存', default: 0 })
  inventory: number;

  @Column({ comment: '商品主图' })
  pic: string;

  @Column({
    comment: '售价',
    type: 'decimal',
    scale: 2,
    precision: 10,
  })
  price: number;

  @Column({
    comment: '原价',
    type: 'decimal',
    scale: 2,
    precision: 10,
  })
  originalPrice: number;

  @Column({
    comment: '成本价',
    type: 'decimal',
    scale: 2,
    precision: 10,
  })
  costPrice: number;

  @Column({ comment: '编码', nullable: true })
  num: string;
}

import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 分类
 */
@EntityModel('goods_category')
export class GoodsCategoryEntity extends BaseEntity {
  @Column({ comment: '名称' })
  name: string;

  @Index()
  @Column({ comment: '父ID', type: 'bigint', nullable: true })
  parentId: number;

  @Column({ comment: '排序', default: 0 })
  sortNum: number;

  @Column({ comment: '图片', nullable: true })
  pic: string;
}

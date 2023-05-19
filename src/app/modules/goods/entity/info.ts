import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 商品
 */
@Index(['title', 'subTitle', 'keywords'], { fulltext: true, parser: 'ngram' })
@EntityModel('goods_info')
export class GoodsInfoEntity extends BaseEntity {
  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '副标题', nullable: true })
  subTitle: string;

  @Index()
  @Column({
    comment: '最低价格',
    type: 'decimal',
    scale: 2,
    precision: 10,
    nullable: true,
  })
  minPrice: number;

  @Index()
  @Column({
    comment: '最高价格',
    type: 'decimal',
    scale: 2,
    precision: 10,
    nullable: true,
  })
  maxPrice: number;

  @Column({ comment: '商品主图' })
  pic: string;

  @Column({ comment: '商品图片 多张图片按“,”隔开', type: 'text' })
  pics: string;

  @Column({ comment: '主图视频', nullable: true })
  video: string;

  @Column({ comment: '视频封面', nullable: true })
  videoCover: string;

  @Column({ comment: '详情', type: 'text', nullable: true })
  detail: string;

  @Column({ comment: '商品简介', type: 'text', nullable: true })
  introduction: string;

  @Index()
  @Column({ comment: '状态 0：下架  1：上架', type: 'tinyint', default: 0 })
  status: number;

  @Column({ comment: '销量', type: 'int', default: 0 })
  sales: number;

  @Column({ comment: '库存', type: 'int', default: 0 })
  inventory: number;

  @Column({ comment: '分类ID', type: 'bigint' })
  categoryId: number;

  @Column({ comment: '类型 0：实物  1：虚拟', type: 'tinyint', default: 0 })
  type: number;

  @Column({
    comment: '规格类型 0：单规格 1：多规格',
    type: 'tinyint',
    default: 0,
  })
  specsType: number;

  @Column({ comment: '排序', type: 'int', default: 0 })
  orderNum: number;

  @Column({ comment: '搜索关键字', nullable: true })
  keywords: string;

  @Column({ comment: '评分', type: 'int', default: 100 })
  score: number;

  @Column({ comment: '是否推荐', type: 'int', default: 0 })
  recomment: number;
}

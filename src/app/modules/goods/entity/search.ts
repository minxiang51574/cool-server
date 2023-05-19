import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column } from 'typeorm';

/**
 * 搜索记录
 */
@EntityModel('goods_search')
export class GoodsSearchEntity extends BaseEntity {
  @Column({ comment: '搜索内容' })
  content: string;
}

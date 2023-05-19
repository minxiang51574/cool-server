import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column } from 'typeorm';

/**
 * 规格模板
 */
@EntityModel('goods_specs_template')
export class GoodsSpecsTemplateEntity extends BaseEntity {
  @Column({ comment: '名称' })
  name: string;

  @Column({ comment: '数据' })
  data: string;
}

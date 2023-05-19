import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column } from 'typeorm';

/**
 * 描述
 */
@EntityModel('conf_page')
export class ConfPageEntity extends BaseEntity {
  @Column({ comment: '名称' })
  name: string;

  @Column({ comment: '路径', nullable: true })
  path: string;

  @Column({ comment: '图标', nullable: true })
  icon: string;

  @Column({ comment: '代码', nullable: true, type: 'text' })
  code: string;

  @Column({ comment: '0 关闭  1 开启', default: 0 })
  status: number;
}

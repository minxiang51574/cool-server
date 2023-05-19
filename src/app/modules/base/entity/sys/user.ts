import { EntityModel } from '@midwayjs/orm';
import { BaseEntity } from '@cool-midway/core';
import { Column, Index } from 'typeorm';

/**
 * 系统用户
 */
@EntityModel('base_sys_user')
export class BaseSysUserEntity extends BaseEntity {
  @Index()
  @Column({ comment: '部门ID', type: 'bigint', nullable: true })
  departmentId: number;

  @Column({ comment: '姓名', nullable: true })
  name: string;

  @Index({ unique: true })
  @Column({ comment: '用户名', length: 100 })
  username: string;

  @Column({ comment: '密码' })
  password: string;

  @Column({
    comment: '密码版本, 作用是改完密码，让原来的token失效',
    default: 1,
  })
  passwordV: number;

  @Column({ comment: '昵称', nullable: true })
  nickName: string;

  @Column({ comment: '头像', nullable: true })
  headImg: string;

  @Index()
  @Column({ comment: '手机', nullable: true, length: 20 })
  phone: string;

  @Column({ comment: '邮箱', nullable: true })
  email: string;

  @Column({ comment: '备注', nullable: true })
  remark: string;

  @Column({ comment: '状态 0:禁用 1：启用', default: 1, type: 'tinyint' })
  status: number;
  // 部门名称
  departmentName: string;
  // 角色ID列表
  roleIdList: number[];

  @Column({ comment: 'socketId', nullable: true })
  socketId: string;

  // 是否客服
  @Column({ comment: '状态 0:否 1：是', default: 0 })
  isCs: number;

  @Column({ comment: '是否推送', default: 0 })
  isPush: number;

  @Index()
  @Column({ comment: '公众号openid', nullable: true })
  openid: string;

  @Column({ comment: '场景id', nullable: true })
  sceneId: string;

  @Column({ comment: '微信昵称', nullable: true })
  wxNickName: string;
}

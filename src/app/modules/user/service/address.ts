import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { UserAddressEntity } from '../entity/address';
import { Context } from 'egg';

/**
 * 地址
 */
@Provide()
export class UserAddressService extends BaseService {
  @InjectEntityModel(UserAddressEntity)
  userAddressEntity: Repository<UserAddressEntity>;

  @Inject()
  ctx: Context;
  /**
   * 新增
   * @param param
   * @returns
   */
  async add(param: UserAddressEntity) {
    if (param.isDefault) {
      await this.userAddressEntity.update(
        { userId: param.userId },
        { isDefault: false }
      );
    }
    return await this.userAddressEntity.insert(param);
  }

  /**
   * 修改
   * @param param
   * @returns
   */
  async update(param: UserAddressEntity) {
    if (param.isDefault) {
      await this.userAddressEntity.update(
        { userId: param.userId },
        { isDefault: false }
      );
    }
    this.userAddressEntity.update({ id: param.id }, param);
    return;
  }
  /**
   * 列表信息
   */
  async list() {
    return this.userAddressEntity
      .createQueryBuilder()
      .where('userId = :userId ', { userId: this.ctx.user.id })
      .addOrderBy('isDefault', 'DESC')
      .getMany();
  }

  /**
   * 修改|新增信息之后
   * @param param
   */
  async modifyAfter(param) {
    if (param.isDefault) {
      await this.userAddressEntity
        .createQueryBuilder()
        .update()
        .set({ isDefault: false })
        .where('userId = :userId ', { userId: this.ctx.appUser.id })
        .andWhere('id != :id', { id: param.id })
        .execute();
    }
  }

  /**
   * 默认地址
   */
  async default(userId) {
    return await this.userAddressEntity.findOne({ userId, isDefault: true });
  }
}

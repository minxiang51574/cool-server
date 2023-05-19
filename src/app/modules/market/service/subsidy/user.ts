import { Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository, MoreThan } from 'typeorm';
import { MarketSubsidyUserEntity } from '../../entity/subsidy/user';
import { MarketSubsidyConfEntity } from '../../entity/subsidy/conf';
import { MarketActivityInfoEntity } from '../../entity/activity/info';

/**
 * 补贴用户
 */
@Provide()
export class MarketSubsidyUserService extends BaseService {
  @InjectEntityModel(MarketSubsidyUserEntity)
  marketSubsidyUserEntity: Repository<MarketSubsidyUserEntity>;

  @InjectEntityModel(MarketSubsidyConfEntity)
  marketSubsidyConfEntity: Repository<MarketSubsidyConfEntity>;

  @InjectEntityModel(MarketActivityInfoEntity)
  marketActivityInfoEntity: Repository<MarketActivityInfoEntity>;

  /**
   * 获得详情
   * @param userId
   * @param activityId
   * @returns
   */
  async detail(userId, activityId) {
    return this.marketSubsidyUserEntity.findOne({ userId, activityId });
  }

  /**
   * 领取补贴金
   * @param userId
   * @param activityId
   */
  async receive(userId, activityId) {
    const info = await this.marketSubsidyConfEntity.findOne({ activityId });
    const activity = await this.marketActivityInfoEntity.findOne({
      id: activityId,
    });
    const userSubsidy = await this.marketSubsidyUserEntity.findOne({
      userId,
      activityId,
      endTime: MoreThan(new Date()),
    });
    if (userSubsidy) {
      throw new CoolCommException('不可重复领取');
    } else {
      await this.marketSubsidyUserEntity.insert({
        activityId,
        userId,
        money: info?.money,
        endTime: activity?.endTime,
      });
    }
  }

  /**
   * 获得优惠金额
   */
  async remain(userId, activityId) {
    const info = await this.marketSubsidyUserEntity
      .createQueryBuilder()
      .where('userId=:userId and activityId =:activityId', {
        userId,
        activityId,
      })
      .andWhere('endTime >= NOW()')
      .getOne();
    if (info) {
      return info.remain;
    }
    return 0.0;
  }
}

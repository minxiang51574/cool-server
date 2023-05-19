import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { MarketSubsidyGoodsEntity } from '../../entity/subsidy/goods';
import { MarketSubsidyUserEntity } from '../../entity/subsidy/user';
import { MarketSubsidyUserService } from './user';
import * as _ from 'lodash';
import { OrderGoodsEntity } from '../../../order/entity/goods';
import * as MyBigNumber from 'my-bignumber';

/**
 * 补贴
 */
@Provide()
export class MarketSubsidyGoodsService extends BaseService {
  @InjectEntityModel(MarketSubsidyGoodsEntity)
  marketSubsidyGoodsEntity: Repository<MarketSubsidyGoodsEntity>;

  @InjectEntityModel(MarketSubsidyUserEntity)
  marketSubsidyUserEntity: Repository<MarketSubsidyUserEntity>;

  @Inject()
  marketSubsidyUserService: MarketSubsidyUserService;

  /**
   * 获得商品可优惠金额
   */
  async distcount(goods: OrderGoodsEntity[], userId) {
    for (const item of goods) {
      // 该商品有参与活动
      if (item.activityId && item.activityType == 0) {
        // 用户剩下多少补贴额度
        let remain = await this.marketSubsidyUserService.remain(
          userId,
          item.activityId
        );
        // 补贴额度大于0
        if (remain > 0) {
          // 该商品补贴多少钱
          const subsidy: MarketSubsidyGoodsEntity =
            await this.marketSubsidyGoodsEntity.findOne({
              goodsId: item.goodsId,
            });
          // 总共补贴多少钱，同个商品买多个
          const disMoney = MyBigNumber.mul(
            subsidy.subsidyMoney,
            item.goodsCount
          );
          // 补贴完剩下多少钱
          remain = MyBigNumber.minus(remain, disMoney);
          item.discountPrice = remain >= 0 ? disMoney : remain;
          await this.marketSubsidyUserEntity.update(
            { userId, activityId: item.activityId },
            { remain: remain >= 0 ? remain : 0 }
          );
        }
      }
    }
  }
}

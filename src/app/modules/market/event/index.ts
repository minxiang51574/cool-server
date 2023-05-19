import { Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { CoolEvent, Event } from '@cool-midway/core';
import { Repository } from 'typeorm';
import { OrderGoodsEntity } from '../../order/entity/goods';
import { MarketActivityGoodsEntity } from '../entity/activity/goods';
import * as _ from 'lodash';
import { MarketActivityGoodsService } from '../service/activity/goods';
import { MarketCouponsInfoEntity } from '../entity/coupons/info';
import { MarketCouponsUserEntity } from '../entity/coupons/couponsUser';

/**
 * 接收事件
 */
@Provide()
@Scope(ScopeEnum.Singleton)
@CoolEvent()
export class MarketEvent {
  @InjectEntityModel(MarketActivityGoodsEntity)
  marketActivityGoodsEntity: Repository<MarketActivityGoodsEntity>;

  @InjectEntityModel(OrderGoodsEntity)
  orderGoodsEntity: Repository<OrderGoodsEntity>;

  @Inject()
  marketActivityGoodsService: MarketActivityGoodsService;

  @InjectEntityModel(MarketCouponsInfoEntity)
  marketCouponsInfoEntity: Repository<MarketCouponsInfoEntity>;

  @InjectEntityModel(MarketCouponsUserEntity)
  marketCouponsUserEntity: Repository<MarketCouponsUserEntity>;

  // 监听商品状态
  @Event('goodsStatus')
  async goodsStatus(goodsId, status) {
    // 更新活动商品状态
    if (status == 0) {
      await this.marketActivityGoodsEntity.update({ goodsId }, { status });
    }
  }

  // 商品支付成功
  @Event('orderPayed')
  async orderPayed(order) {
    const goods = await this.orderGoodsEntity.find({ orderId: order.id });
    if (_.isEmpty(goods)) {
      for (const item of goods) {
        // 活动
        if (item.activityId) {
          await this.marketActivityGoodsService.updateGoodsSales(
            item.goodsId,
            item.activityId,
            item.goodsCount
          );
        }
      }
    }
  }
  // 为新用户发送新人卷
  @Event('newUser')
  async newUser(user) {
    // 查询所有新人券
    const coupons = await this.marketCouponsInfoEntity.find({
      way: 1,
      open: 1,
    });
    // 向用户插入优惠券
    for (const i of coupons) {
      await this.marketCouponsUserEntity.insert({
        couponsId: i.id,
        userId: user.id,
      });
    }
  }
}

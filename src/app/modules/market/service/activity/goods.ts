import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { MarketActivityGoodsEntity } from '../../entity/activity/goods';
import * as _ from 'lodash';
import { MarketActivityInfoEntity } from '../../entity/activity/info';
import { MarketSubsidyGoodsEntity } from '../../entity/subsidy/goods';
import { OrderGoodsEntity } from '../../../order/entity/goods';
import { MarketSubsidyGoodsService } from '../subsidy/goods';
import { GoodsInfoEntity } from '../../../goods/entity/info';
import { GoodsInfoService } from '../../../goods/service/info';

/**
 * 描述
 */
@Provide()
export class MarketActivityGoodsService extends BaseService {
  @InjectEntityModel(MarketActivityGoodsEntity)
  marketActivityGoodsEntity: Repository<MarketActivityGoodsEntity>;

  @InjectEntityModel(MarketActivityInfoEntity)
  marketActivityInfoEntity: Repository<MarketActivityInfoEntity>;

  @InjectEntityModel(MarketSubsidyGoodsEntity)
  marketSubsidyGoodsEntity: Repository<MarketSubsidyGoodsEntity>;

  @InjectEntityModel(OrderGoodsEntity)
  orderGoodsEntity: Repository<OrderGoodsEntity>;

  @InjectEntityModel(GoodsInfoEntity)
  goodsInfoEntity: Repository<GoodsInfoEntity>;

  @Inject()
  marketSubsidyGoodsService: MarketSubsidyGoodsService;

  @Inject()
  goodsInfoService: GoodsInfoService;

  @Inject()
  ctx;

  /**
   * 商品选择
   * @param param
   */
  async selectGoods(param) {
    const { activityId, keyWord } = param;
    const goodsIds = (
      await this.marketActivityGoodsEntity.find({ activityId })
    ).map(e => {
      return e.goodsId;
    });
    const sql = `SELECT
      * 
    FROM
      goods_info a 
    WHERE
      1 =1
    ${this.setSql(keyWord, 'and (a.title like ?)', [`%${keyWord}%`])}
    ${this.setSql(!_.isEmpty(goodsIds), 'and a.id not in(?)', [goodsIds])}`;
    return this.sqlRenderPage(sql, param);
  }

  async info(id) {
    const activity = await this.marketActivityGoodsEntity.findOne({ id });
    const goods = await this.goodsInfoService.info(activity.goodsId);
    if (activity.activityType == 0) {
      const subsidy = await this.marketSubsidyGoodsEntity.findOne({
        goodsId: goods.id,
        activityId: activity.activityId,
      });
      activity['subsidyMoney'] = subsidy?.subsidyMoney;
    }
    return { activity, goods };
  }

  /**
   * 新增活动商品
   * @param param
   * @returns
   */
  async add(param) {
    const { goods, activity } = param;
    //const originalGoods = await this.goodsInfoService.info(goods.id);
    await this.goodsInfoService.update(goods);
    activity.goodsId = goods.id;
    //activity.originalGoods = JSON.stringify(originalGoods);
    const resultId = await this.marketActivityGoodsEntity.save(activity);
    await this.modifyAfter(param);
    return resultId;
  }

  /**
   * 更新
   * @param param
   */
  async update(param) {
    const { goods, activity } = param;
    await this.goodsInfoService.update(goods);
    activity.goodsId = goods.id;
    await this.marketActivityGoodsEntity.save(activity);
    await this.modifyAfter(param);
  }

  /**
   * 新增|修改之后
   * @param param
   */
  async modifyAfter(param) {
    // 删除
    // if (Array.isArray(param)) {
    //   for (const id of param) {
    //     const info = await this.marketActivityGoodsEntity.findOne({ id });
    //     if (info) {
    //       await this.goodsInfoService.update(JSON.parse(info.originalGoods));
    //     }
    //   }
    //   return;
    // }
    // 更新和修改
    const { goods, activity } = param;
    // if (activity.status == 0) {
    //   await this.goodsInfoService.update(JSON.parse(activity.originalGoods));
    //   return;
    // }
    if (goods && activity) {
      switch (activity.activityType) {
        // 补贴
        case 0:
          await this.subsidy(param);
          break;
      }
    }
  }

  /**
   * 补贴
   */
  async subsidy(param) {
    const { goods, activity } = param;
    let check = await this.marketSubsidyGoodsEntity.findOne({
      activityId: activity.activityId,
      goodsId: goods.id,
    });
    if (!check) {
      check = new MarketSubsidyGoodsEntity();
    }
    check.subsidyMoney = activity.subsidyMoney;
    check.activityId = activity.activityId;
    check.goodsId = goods.id;
    await this.marketSubsidyGoodsEntity.save(check);
  }

  /**
   * 更新活动商品销量
   * @param goodsId
   * @param activityId
   * @param salesCount
   */
  async updateGoodsSales(goodsId, activityId, salesCount) {
    await this.nativeQuery(
      `UPDATE market_activity_goods a 
    SET a.salesCount = a.salesCount +? 
    WHERE
      a.goodsId = ? AND
      a.activityId = ?`,
      [salesCount, goodsId, activityId]
    );
  }

  /**
   * 获得状态
   * @param goodsId
   * @param activityId
   * @param userId
   * @returns
   */
  async status(goodsId, activityId, userId) {
    const info = await this.marketActivityGoodsEntity.findOne({
      goodsId,
      activityId,
    });
    if (info) {
      const { userLimitCount, limitCount } = info;
      const orderGoods = await this.orderGoodsEntity.find({
        goodsId,
        activityId,
      });
      let userCount = 0;
      // 该活动已经卖几件
      const currentCount = orderGoods
        .map(e => {
          if (e.userId == userId) {
            userCount += e.goodsCount;
          }
          return e.goodsCount;
        })
        .reduce((total, current) => {
          return total + current;
        }, 0);
      if (currentCount >= limitCount || userCount >= userLimitCount) {
        return { status: 0 };
      }
    }
    return { status: 1 };
  }
  /**
   * 活动商品
   * @param query
   * @returns
   */
  async activityGoods(query) {
    const { activityId } = query;
    const sql = `SELECT
      b.*,
      a.limitCount,
      a.userLimitCount,
      a.sortNum
    FROM
      market_activity_goods a
      JOIN market_activity_info b ON a.activityId = b.id
      LEFT JOIN goods_info c ON a.goodsId = c.id
      WHERE 1=1 AND b.status = 1 AND b.endTime >= NOW()
     ${this.setSql(activityId, 'AND a.activityId', [activityId])}`;
    return this.sqlRenderPage(sql, query);
  }

  /**
   * 商品的优惠价格
   * @param goods
   */
  async discountPrice(goods: OrderGoodsEntity[], userId) {
    // 补贴优惠
    await this.marketSubsidyGoodsService.distcount(goods, userId);
  }

  /**
   * 根据商品ID集合 获得商品的活动信息
   * @param goodsIds
   * @returns
   */
  async activitysByGoodsIds(goodsIds) {
    if (_.isEmpty(goodsIds)) {
      goodsIds = [0];
    }
    return this.nativeQuery(
      `SELECT
      b.*,
      a.goodsId 
    FROM
      market_activity_goods a
      JOIN market_activity_info b ON a.activityId = b.id 
    WHERE
      b.STATUS = 1 
      AND a.status = 1
      AND a.goodsId IN (?)`,
      [goodsIds]
    );
  }
}

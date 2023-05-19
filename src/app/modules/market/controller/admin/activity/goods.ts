import { ALL, Body, Inject, Post, Provide } from '@midwayjs/decorator';
import {
  CoolController,
  BaseController,
  QueryOp,
  LeftJoinOp,
} from '@cool-midway/core';
import { GoodsInfoEntity } from '../../../../goods/entity/info';
import { MarketActivityGoodsEntity } from '../../../entity/activity/goods';
import { MarketActivityInfoEntity } from '../../../entity/activity/info';
import { MarketSubsidyGoodsEntity } from '../../../entity/subsidy/goods';
import { MarketActivityGoodsService } from '../../../service/activity/goods';

/**
 * 活动商品
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MarketActivityGoodsEntity,
  service: MarketActivityGoodsService,
  pageQueryOp: ctx => {
    if (!ctx) {
      return;
    }
    const { activityType } = ctx.request.body;
    return new Promise<QueryOp>(res => {
      const data = {
        keyWordLikeFields: ['b.title'],
        select: [
          'a.*, b.title, b.subTitle, b.pic, b.minPrice, b.inventory, b.sales',
        ],
        leftJoin: [
          {
            entity: GoodsInfoEntity,
            condition: 'a.goodsId = b.id',
            alias: 'b',
          },
          {
            entity: MarketActivityInfoEntity,
            condition: 'a.activityId = c.id',
            alias: 'c',
          },
        ],
      } as QueryOp;
      // 补贴
      if (activityType == 0) {
        data.select.push('d.subsidyMoney');
        //@ts-ignore
        data.leftJoin.push({
          entity: MarketSubsidyGoodsEntity,
          condition: 'a.goodsId = d.goodsId',
          alias: 'd',
        } as LeftJoinOp);
      }
      res(data);
    });
  },
})
export class AdminMarketActivityGoodsController extends BaseController {
  @Inject()
  marketActivityGoodsService: MarketActivityGoodsService;
  /**
   * 活动商品选择，过滤已存在
   * @param activityId
   */
  @Post('/selectGoods')
  async selectGoods(@Body(ALL) params) {
    return this.ok(await this.marketActivityGoodsService.selectGoods(params));
  }
}

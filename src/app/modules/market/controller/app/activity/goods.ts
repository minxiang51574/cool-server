import {
  ALL,
  Body,
  Get,
  Inject,
  Post,
  Provide,
  Query,
} from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { MarketActivityGoodsEntity } from '../../../entity/activity/goods';
import { MarketActivityGoodsService } from '../../../service/activity/goods';

/**
 * 活动商品
 */
@Provide()
@CoolController({
  api: [],
  entity: MarketActivityGoodsEntity,
  service: MarketActivityGoodsService,
})
export class AppMarketActivityGoodsController extends BaseController {
  @Inject()
  marketActivityGoodsService: MarketActivityGoodsService;

  @Inject()
  ctx;

  /**
   * 活动商品
   * @param param
   * @returns
   */
  @Post('/activityGoods')
  async activityGoods(@Body(ALL) param) {
    return this.ok(await this.marketActivityGoodsService.activityGoods(param));
  }

  /**
   * 获得限制状态
   * @param goodsId
   * @param activityId
   * @returns
   */
  @Get('/status')
  async status(@Query() goodsId, @Query() activityId) {
    return this.ok(
      await this.marketActivityGoodsService.status(
        goodsId,
        activityId,
        this.ctx.user.id
      )
    );
  }
}

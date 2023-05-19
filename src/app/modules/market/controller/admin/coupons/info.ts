import { Provide, Get, Inject, Query, Post, Body } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { MarketCouponsInfoEntity } from '../../../entity/coupons/info';
import { MarketCouponsInfoService } from '../../../service/coupons/info';
import { Context } from 'egg';

/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MarketCouponsInfoEntity,
  service: MarketCouponsInfoService,
})
export class AdminMarketCouponsController extends BaseController {
  @Inject()
  marketCouponsInfoService: MarketCouponsInfoService;

  @Inject()
  ctx: Context;

  /**
   * 发送优惠券
   */
  @Post('/sendIds')
  async sendIds(@Body() id: number, @Body() userIds: []) {
    return this.ok(await this.marketCouponsInfoService.sendIds(id, userIds));
  }

  /**
   * 根据id获取优惠券的林区记录
   * @param id
   */
  @Get('/getRecord')
  async getRecord(@Query() id: number) {
    return this.ok(await this.marketCouponsInfoService.getRecord(id));
  }
}

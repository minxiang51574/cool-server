import {
  Get,
  Inject,
  Post,
  Provide,
  Query,
  Body,
  ALL,
} from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { MarketCouponsInfoEntity } from '../../../entity/coupons/info';
import { MarketCouponsInfoService } from '../../../service/coupons/info';
import { Context } from 'egg';

/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'page', 'list'],
  entity: MarketCouponsInfoEntity,
  service: MarketCouponsInfoService,
})
export class MarketCouponsInfoController extends BaseController {
  @Inject()
  marketCouponsInfoService: MarketCouponsInfoService;

  @Inject()
  ctx: Context;
  /**
   * 领取优惠券
   * @param id
   *
   */
  @Get('/receive')
  async receive(@Query() id: number) {
    return this.ok(
      await this.marketCouponsInfoService.receive(id, this.ctx.user.id)
    );
  }

  // /**
  //  * 发送优惠券
  //  */
  // @Get('/send')
  // async send(@Query() way: number) {
  //   await this.marketCouponsInfoService.send(way, this.ctx.user.id);
  // }

  /**
   * 获取当前用户的优惠券
   * @param userId
   * @returns
   */
  @Post('/my')
  async getMyCoupons(@Body(ALL) query: any) {
    query['userId'] = this.ctx.user.id;
    return this.ok(
      await this.marketCouponsInfoService.getCouponsByUserId(query)
    );
  }
}

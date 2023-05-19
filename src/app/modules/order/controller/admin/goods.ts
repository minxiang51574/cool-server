import { Body, Inject, Post, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { OrderGoodsEntity } from '../../entity/goods';
import { OrderGoodsService } from '../../service/goods';
import { Context } from 'egg';

/**
 * 订单商品
 */
@Provide()
@CoolController({
  api: ['page'],
  entity: OrderGoodsEntity,
  service: OrderGoodsService,
})
export class AdminOrderGoodsController extends BaseController {
  @Inject()
  orderGoodsService: OrderGoodsService;
  @Inject()
  ctx: Context;
  /**
   * 同意退款
   * @param id
   */
  @Post('/agreeRefund')
  async agreeRefund(@Body() id: number) {
    await this.orderGoodsService.agreeRefund(id);
    this.ok();
  }

  /**
   * 拒绝退款
   * @param id
   * @param reason 拒绝原因
   */
  @Post('/rejectRefund')
  async rejectRefund(@Body() id: number, @Body() reason: string) {
    await this.orderGoodsService.rejectRefund(id, reason);
    this.ok();
  }
}

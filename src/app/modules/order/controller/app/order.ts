import {
  Body,
  Get,
  Inject,
  Post,
  Provide,
  Query,
  ALL,
} from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { UserAddressEntity } from '../../../user/entity/address';
import { OrderGoodsEntity } from '../../entity/goods';
import { OrderInfoService } from '../../service/order';
import { OrderInfoEntity } from '../../entity/info';
import { OrderGoodsService } from '../../service/goods';

/**
 * 订单
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'info', 'list', 'page'],
  entity: OrderInfoEntity,
  service: OrderInfoService,
})
export class AppOrderInfoController extends BaseController {
  @Inject()
  orderInfoService: OrderInfoService;

  @Inject()
  orderGoodsService: OrderGoodsService;

  @Inject()
  ctx;

  /**
   * 物流
   * @param orderId
   * @returns
   */
  @Get('/logistics')
  async logistics(@Query() orderId: number) {
    return this.ok(await this.orderInfoService.logistics(orderId));
  }

  /**
   * 提交订单
   * @param address 地址
   * @param goods 订单商品
   * @returns
   */
  @Post('/submit')
  async submit(
    @Body() address: UserAddressEntity,
    @Body() goods: OrderGoodsEntity[],
    @Body() couponsId: number,
    @Body() sumPrice: number
  ) {
    return this.ok(
      await this.orderInfoService.submit(
        this.ctx.user.id,
        address,
        goods,
        couponsId,
        sumPrice
      )
    );
  }

  /**
   * 确认收货
   * @param orderId 订单ID
   */
  @Post('/confirm')
  async confirm(@Body() orderId: number) {
    await this.orderInfoService.confirm(orderId);
    return this.ok();
  }

  /**
   * 退款
   * @param orderId 订单
   * @param goods 商品
   */
  @Post('/refund')
  async refund(@Body() orderId: number, @Body() goods: OrderGoodsEntity[]) {
    await this.orderInfoService.refund(orderId, goods);
    return this.ok();
  }

  /**
   * 关闭订单
   * @param orderId
   * @returns
   */
  @Get('/close')
  async close(@Query(ALL) query) {
    await this.orderInfoService.close(query);
    return this.ok();
  }

  /**
   * 取消退款
   * @param orderId 订单
   * @param orderGoodsId 商品
   */
  @Post('/cancelRefund')
  async cancelRefund(@Body() orderId: number, @Body() id: number) {
    await this.orderInfoService.cancelRefund(orderId, id);
    return this.ok();
  }

  /**
   * 获取当前用户的订单
   * @param userId
   */
  @Get('/count')
  async cuont() {
    return this.ok(await this.orderInfoService.count(this.ctx.user.id));
  }

  /**
   * 售后列表
   * @param userId
   */
  @Post('/aftersale')
  async aftersale(@Body(ALL) query) {
    return this.ok(
      await this.orderGoodsService.aftersale(query, this.ctx.user.id)
    );
  }
}

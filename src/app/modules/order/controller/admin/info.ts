import { Body, Inject, Post, Provide, Query, Get } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { OrderInfoEntity } from '../../entity/info';
import { OrderInfoService } from '../../service/order';

/**
 * 订单
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: OrderInfoEntity,
  service: OrderInfoService,
})
export class AdminOrderInfoController extends BaseController {
  @Inject()
  orderInfoService: OrderInfoService;

  /**
   * 发货
   */
  @Post('/deliver')
  async deliver(
    @Body() orderId: number,
    @Body() logisticsOrderNum: string,
    @Body() logisticsName: string
  ) {
    return this.ok(
      await this.orderInfoService.deliver(
        orderId,
        logisticsOrderNum,
        logisticsName
      )
    );
  }

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
   * 获得所有订单
   */
  @Get('/orderAll')
  async orderAll() {
    return this.ok(await this.orderInfoService.orderAll());
  }
}

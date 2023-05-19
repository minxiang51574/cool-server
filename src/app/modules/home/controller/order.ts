import { Get, Inject, Provide, Query, ALL } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { OrderHomeService } from '../service/order';

/**
 * 描述
 */
@Provide()
@CoolController('/admin/orderHome')
export class OrderHomeController extends BaseController {
  @Inject()
  orderHomeService: OrderHomeService;
  // /**
  //  * 获得所有订单
  //  * @returns
  //  */
  // @Get('/orderAll')
  // async orderAll() {
  //   return this.ok(await this.orderHomeService.orderAll());
  // }
  /**
   * 日订单走势
   */
  @Get('/orderDayChart')
  async orderDayChart(@Query() dayCount) {
    return this.ok(await this.orderHomeService.orderDayChart(dayCount));
  }
  /**
   * 查询购买商品的排行
   */
  @Get('/goodsbuyNum')
  async goodsbuyNum() {
    return this.ok(await this.orderHomeService.goodsbuyNum());
  }

  /**
   * 获得购买的商品类型
   * @param query
   * @returns
   */
  @Get('/getType')
  async getType(@Query(ALL) query: any) {
    return this.ok(await this.orderHomeService.getType(query));
  }
}

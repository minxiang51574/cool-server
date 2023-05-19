import { Get, Inject, Provide, Query } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { ToralTurnoverService } from '../service/totalTurnover';

/**
 * 总收入控制器
 */
@Provide()
@CoolController('/admin/totalTurnover')
export class UPageToalTurnoverController extends BaseController {
  @Inject()
  toralTurnoverService: ToralTurnoverService;

  /**
   * 总收入
   */
  @Get('/getVipToral')
  async getVipToral() {
    return this.ok(await this.toralTurnoverService.getVipToral());
  }
  @Get('/getWeekMoney')
  async getMoney() {
    return this.ok(await this.toralTurnoverService.getWeekMoney());
  }
  /**
   * 获得日同比
   */
  @Get('/getDayMoney')
  async getDayMoney() {
    return this.ok(await this.toralTurnoverService.getDayMoney());
  }

  /**
   * 订单走势
   */
  @Get('/orderChart')
  async orderChart(@Query() dayCount) {
    return this.ok(await this.toralTurnoverService.orderChart(dayCount));
  }

  /**
   * 订单月走势
   */
  @Get('/orderMonthChart')
  async orderMonthChart(@Query() dayCount = 14) {
    return this.ok(await this.toralTurnoverService.orderMonthChart(dayCount));
  }

  /**
   * 订单走势
   */
  @Get('/orderDayChart')
  async orderDayChart(@Query() dayCount) {
    return this.ok(await this.toralTurnoverService.orderDayChart(dayCount));
  }
}

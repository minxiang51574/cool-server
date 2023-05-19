import { Provide, Post, Inject, Body, ALL } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { OrderPayService } from '../../service/pay';

/**
 * 支付
 */
@Provide()
@CoolController()
export class UserPayController extends BaseController {
  @Inject()
  orderPayService: OrderPayService;
  /**
   * 小程序支付支付
   */
  @Post('/wxMiniPay')
  async wxMiniPay(@Body() orderId: string) {
    return this.ok(await this.orderPayService.wxMiniPay(orderId));
  }
  /**
   * 微信支付通知回调
   */
  @Post('/wxNotify')
  async wxNotify() {
    await this.orderPayService.wxNotify();
  }

  /**
   * 微信JSSDK支付参数(自动下单, 兼容小程序)
   */
  @Post('/wxMpPay')
  async wxJSApi(@Body() orderId: number) {
    return this.ok(await this.orderPayService.wxJSApi(orderId));
  }

  /**
   * 微信JSSDK支付参数(自动下单, 兼容小程序)
   */
  @Post('/wxH5Pay')
  async wxH5Pay(@Body(ALL) query: any) {
    return this.ok(await this.orderPayService.wxH5Pay(query));
  }
}

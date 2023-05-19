import { Inject, Provide } from '@midwayjs/decorator';
import { BaseCoolQueue, Queue } from '@cool-midway/queue';
import { OrderInfoService } from '../service/order';
import { OrderGoodsEntity } from '../entity/goods';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';

/**
 * 订单队列
 */
@Queue()
@Provide()
export abstract class OrderQueue extends BaseCoolQueue {
  @Inject()
  orderInfoService: OrderInfoService;

  @InjectEntityModel(OrderGoodsEntity)
  orderGoodsEntity: Repository<OrderGoodsEntity>;

  async data(job: any, done: any) {
    if (job.data.action == 'close') {
      await this.orderInfoService.close({
        id: job.data.orderId,
        cancelReason: '超时未支付，系统关闭订单',
      });
    } else if (job.data.action == 'deliver') {
      await this.orderDeliver(job.data.orderId);
    }
    done();
  }

  /**
   * 自动确认收货
   * @param orderId
   */
  async orderDeliver(orderId: number) {
    // 判断当前订单的商品是否正常
    const orderGoods = await this.orderGoodsEntity.find({ orderId });
    let flag = 0;
    for (const i of orderGoods) {
      if (i.status == 0) {
        flag += 1;
      }
    }
    if (orderGoods.length == flag) {
      // 将订单确认收货
      await this.orderInfoService.confirm(orderId);
    }
  }
}

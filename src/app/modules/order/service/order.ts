import { Config, Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolTransaction } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository, QueryRunner } from 'typeorm';
import { OrderInfoEntity } from '../entity/info';
import * as _ from 'lodash';
import axios from 'axios';
import { OrderGoodsEntity } from '../entity/goods';
import { UserAddressEntity } from '../../user/entity/address';
import { ICoolWxPay } from '@cool-midway/wxpay';
import { GoodsSpecsService } from '../../goods/service/specs';
import * as MyBigNumber from 'my-bignumber';
import { Context } from 'egg';
import { GoodsSpecsInfoEntity } from '../../goods/entity/specs/info';
import { GoodsInfoEntity } from '../../goods/entity/info';
import { CoolEventManager, CoolCommException } from '@cool-midway/core';
import { MarketCouponsUserEntity } from '../../market/entity/coupons/couponsUser';
import { MarketCouponsInfoEntity } from '../../market/entity/coupons/info';
import { OrderQueue } from '../queue/order';

/**
 * 订单
 */
@Provide()
export class OrderInfoService extends BaseService {
  @InjectEntityModel(OrderInfoEntity)
  orderInfoEntity: Repository<OrderInfoEntity>;

  @InjectEntityModel(OrderGoodsEntity)
  orderGoodsEntity: Repository<OrderGoodsEntity>;

  @InjectEntityModel(GoodsSpecsInfoEntity)
  goodsSpecsInfoEntity: Repository<GoodsSpecsInfoEntity>;

  @InjectEntityModel(GoodsInfoEntity)
  goodsInfoEntity: Repository<GoodsInfoEntity>;

  @InjectEntityModel(MarketCouponsInfoEntity)
  marketCouponsInfoEntity: Repository<MarketCouponsInfoEntity>;

  @InjectEntityModel(MarketCouponsUserEntity)
  marketCouponsUserEntity: Repository<MarketCouponsUserEntity>;

  @Inject('cool:coolEventManager')
  coolEventManager: CoolEventManager;

  @Inject()
  goodsSpecsService: GoodsSpecsService;

  @Config('module.order.logistics')
  logisticsAppCode;

  // 微信支付
  @Inject('wxpay:sdk')
  wxPay: ICoolWxPay;

  @Inject()
  orderQueue: OrderQueue;

  @Inject()
  ctx: Context;

  async info(id: number) {
    // 查询当前订单
    const order = await this.orderInfoEntity.findOne({
      id,
      userId: this.ctx.user.id,
    });
    // 查询当前订单的商品信息
    const orderGoods = await this.orderGoodsEntity.find({
      orderId: id,
      userId: this.ctx.user.id,
    });
    order['goods'] = orderGoods;
    return order;
  }
  /**
   * 分页查询
   * @param query
   * @returns
   */
  async page(query) {
    const { keyWord, status, startTime, endTime, date } = query;
    const sql = `SELECT
        a.*,
        c.nickname as userName
    FROM
        order_info a
        LEFT JOIN order_goods b ON a.id = b.orderId
        LEFT JOIN user_info c on a.userId = c.id
        WHERE 1=1
        ${this.setSql(this.ctx.user, 'AND a.userId = ?', [this.ctx.user?.id])}
        ${this.setSql(startTime, 'AND a.createTime >= ?', [startTime])}
        ${this.setSql(endTime, 'AND a.createTime <= ?', [endTime])}
        ${this.setSql(
          keyWord,
          'AND (a.contact like ? or a.phone like ? or a.orderNum like ?)',
          [`%${keyWord}%`, `%${keyWord}%`, `%${keyWord}%`]
        )}
        ${this.setSql(status, 'AND a.status in (?)', [status])}
        ${this.setSql(date, 'and to_days(a.createTime)= to_days(now())', [])}
        group by a.id`;

    const orders = await this.sqlRenderPage(sql, query);
    const orderIds = orders.list.map(order => {
      return order.id;
    });
    if (!_.isEmpty(orderIds)) {
      const goodsList = await this.nativeQuery(
        'select * from order_goods a where a.orderId in (?)',
        [orderIds]
      );
      const result = [];
      orders.list.forEach(order => {
        order['goodsList'] = _.filter(goodsList, o => o.orderId == order.id);
        order['gn'] = order.goodsList.length;
        result.push(order);
      });
      orders.list = result;
    }
    return orders;
  }

  /**
   * 退款
   * @param orderId 订单ID
   * @param goods 商品
   */
  async refund(orderId: number, goods: OrderGoodsEntity[]) {
    for (const e of goods) {
      const info = await this.orderGoodsEntity.findOne({
        id: e.id,
        orderId,
      });
      if (info && (info.status == 0 || info.status == 3)) {
        const refunPrice = MyBigNumber.minus(
          MyBigNumber.mul(info.price, info.goodsCount),
          info.discountPrice
        );
        info.status = 1;
        Object.assign(info, e);
        info.refundApplyTime = new Date();
        info.refundAmount = refunPrice > 0 ? refunPrice : 0;
        info.remark = e.remark;
        await this.orderGoodsEntity.update(info.id, info);
        // 自动退款处理
      } else {
        throw new CoolCommException('存在不可退款状态的商品');
      }
    }
  }

  /**
   * 取消退款
   * @param orderId
   * @param id
   */
  async cancelRefund(orderId: number, id: number) {
    const info = await this.orderGoodsEntity.findOne({ id, orderId });
    if (info && info.status == 1) {
      info.status = 0;
      await this.orderGoodsEntity.update(id, info);
    } else {
      throw new CoolCommException('不是可以撤销退款的状态');
    }
  }

  /**
   * 物流
   * @param orderId
   */
  async logistics(orderId) {
    const order = await this.orderInfoEntity.findOne({
      id: orderId,
    });
    if (!order) {
      throw new CoolCommException('订单信息不存在');
    }
    const goodsList = await this.orderGoodsEntity.find({
      orderId: order?.id,
    });
    return {
      goodsList,
      order,
      logistics: await this.logisticsInfo(order.logisticsOrderNum),
    };
  }

  /**
   * 发货
   * @param orderId
   * @param logisticsOrderNum
   */
  async deliver(
    orderId: number,
    logisticsOrderNum: string,
    logisticsName: string
  ) {
    await this.orderInfoEntity.update(
      { id: orderId },
      { logisticsOrderNum, logisticsName, status: 2 }
    );
    // 创建延时队列 15天后自动确认收货
    await this.orderQueue.add(
      { orderId, action: 'deliver' },
      {
        removeOnComplete: true,
        removeOnFail: true,
        delay: 15 * 3600 * 1000 * 24,
        // delay: 10 * 1000,
      }
    );
  }

  /**
   * 查询
   * @param no 物流单号
   */
  async logisticsInfo(no) {
    const host = 'http://wuliu.market.alicloudapi.com/kdi';

    if (!no) {
      return null;
    }
    const result = await axios.get(`${host}`, {
      params: { no },
      headers: { Authorization: `APPCODE ${this.logisticsAppCode}` },
    });

    if (result.data.status == '0') {
      return result.data.result;
    } else {
      return result.data.msg;
    }
  }

  /**
   * 关闭订单
   * @param orderId
   * @returns
   */
  async close(query) {
    const { id, cancelReason } = query;
    // 查询订单
    const order = await this.orderInfoEntity.findOne({ id: query.id });
    if (order.status == 0) {
      const result = await this.orderInfoEntity.update(
        { id },
        { status: 5, cancelReason }
      );
      if (order.couponsId) {
        await this.marketCouponsUserEntity.update(
          { couponsId: order.couponsId, userId: order.userId },
          { status: 1 }
        );
      }
      this.coolEventManager.emit('orderClose', id);
      if (result.affected > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * 确认收货
   * @param orderId
   */
  async confirm(orderId: number) {
    await this.orderInfoEntity.update({ id: orderId }, { status: 3 });
  }

  /**
   * 提交订单
   * @param userId
   * @param address
   * @param goods
   * @returns
   */
  @CoolTransaction({ isolation: 'SERIALIZABLE' })
  async submit(
    userId: number,
    address: UserAddressEntity,
    goods: OrderGoodsEntity[],
    couponsId: number,
    sumPrice: number,
    queryRunner?: QueryRunner
  ) {
    const order = new OrderInfoEntity();
    Object.assign(order, address);
    order.orderNum = await this.wxPay.createOrderNum();
    order.userId = userId;
    order.couponsId = couponsId;
    // await this.orderInfoEntity.insert(order);
    await queryRunner.manager.insert<OrderInfoEntity>(OrderInfoEntity, order);
    // // 获取当前优惠券
    const coupons = await this.marketCouponsInfoEntity.findOne({
      id: couponsId,
    });
    await queryRunner.manager.update<MarketCouponsUserEntity>(
      MarketCouponsUserEntity,
      { couponsId, userId },
      { status: 2 }
    );
    // 总金额
    let totalPrice = 0.0;
    // 总优惠金额
    let totalDiscountPrice = 0.0;
    // 优惠价缓存
    let temp = 0.0;
    for (const item of goods) {
      await this.getInventory(item);
      item.userId = userId;
      item.orderId = order.id;
      item.specs = JSON.stringify(item.specs);
      item.price = await this.goodsSpecsService.price(item.goodsId, item.specs);
      totalPrice = MyBigNumber.plus(
        totalPrice,
        MyBigNumber.mul(item.goodsCount, item.price)
      );
      delete item.id;
      await queryRunner.manager.insert<OrderGoodsEntity>(
        OrderGoodsEntity,
        item
      );
      // await this.orderGoodsEntity.insert(item);
      // 发送事件通知
      // this.coolEventManager.emit('orderSubmit', item);
    }
    if (coupons) {
      switch (coupons.type) {
        case 0:
          for (const i of goods) {
            const price = MyBigNumber.mul(i.price, i.goodsCount);
            i.discountPrice = MyBigNumber.mul(
              MyBigNumber.div(price, totalPrice).toFixed(2),
              coupons.couponsPrice
            ).toFixed(2);
            if (price < i.discountPrice) {
              i.discountPrice = price;
            }
            totalDiscountPrice = MyBigNumber.plus(
              totalDiscountPrice,
              i.discountPrice || 0.0
            ).toFixed(2);
            await queryRunner.manager.update<OrderGoodsEntity>(
              OrderGoodsEntity,
              {
                id: i.id,
              },
              { discountPrice: i.discountPrice }
            );
          }
          break;
        case 1:
          for (const i of goods) {
            if (
              (await this.goodsInfoEntity.findOne({ id: i.goodsId }))
                .categoryId == Number(coupons.insider)
            ) {
              temp += MyBigNumber.plus(
                totalDiscountPrice,
                MyBigNumber.mul(i.price, i.goodsCount)
              );
            }
          }
          for (const i of goods) {
            if (
              (await this.goodsInfoEntity.findOne({ id: i.goodsId }))
                .categoryId == Number(coupons.insider)
            ) {
              const price = MyBigNumber.mul(i.price, i.goodsCount);
              i.discountPrice = MyBigNumber.mul(
                MyBigNumber.div(price, temp).toFixed(2),
                coupons.couponsPrice
              ).toFixed(2);
              if (price < i.discountPrice) {
                i.discountPrice = price;
              }
              totalDiscountPrice = MyBigNumber.plus(
                totalDiscountPrice,
                i.discountPrice || 0.0
              );
              await queryRunner.manager.update<OrderGoodsEntity>(
                OrderGoodsEntity,
                {
                  id: i.id,
                },
                { discountPrice: i.discountPrice }
              );
            }
          }
          break;
        case 2:
          for (const i of goods) {
            for (const j of coupons.insider.split(',')) {
              if (i.goodsId == Number(j)) {
                temp += MyBigNumber.plus(
                  totalDiscountPrice,
                  MyBigNumber.mul(i.price, i.goodsCount)
                );
              }
            }
          }
          for (const i of goods) {
            for (const j of coupons.insider.split(',')) {
              if (i.goodsId == Number(j)) {
                const price = MyBigNumber.mul(i.price, i.goodsCount);
                i.discountPrice = MyBigNumber.mul(
                  MyBigNumber.div(price, temp).toFixed(2),
                  coupons.couponsPrice
                ).toFixed(2);
                if (price < i.discountPrice) {
                  i.discountPrice = price;
                }
                totalDiscountPrice = MyBigNumber.plus(
                  totalDiscountPrice,
                  i.discountPrice || 0.0
                );
                await queryRunner.manager.update<OrderGoodsEntity>(
                  OrderGoodsEntity,
                  {
                    id: i.id,
                  },
                  { discountPrice: i.discountPrice }
                );
              }
            }
          }
          break;
        default:
          break;
      }
    }

    // 扣除优惠金额
    totalPrice = MyBigNumber.minus(totalPrice, totalDiscountPrice);
    if (totalPrice <= 0) {
      totalPrice = 0;
      //修改当前订单为已支付
      await queryRunner.manager.update<OrderInfoEntity>(
        OrderInfoEntity,
        { id: order.id },
        {
          price: totalPrice,
          discountPrice: totalDiscountPrice,
          status: 1,
          payType: -1,
        }
      );
      for (const item of goods) {
        // 发送事件通知
        this.coolEventManager.emit('orderSubmit', item);
      }
      return { orderId: order.id };
    }
    if (sumPrice != totalPrice) {
      throw new CoolCommException('请注意你的操作是否越界了！！！');
    }
    for (const item of goods) {
      // 发送事件通知
      this.coolEventManager.emit('orderSubmit', item);
    }
    await queryRunner.manager.update<OrderInfoEntity>(
      OrderInfoEntity,
      { id: order.id },
      { price: totalPrice, discountPrice: totalDiscountPrice }
    );
    // await this.orderInfoEntity.update({ id: order.id }, { price: totalPrice });
    // 创建延时队列 2小时后关闭订单
    await this.orderQueue.add(
      { orderId: order['id'], action: 'close' },
      {
        removeOnComplete: true,
        removeOnFail: true,
        delay: 2 * 3600 * 1000,
        // delay: 10 * 1000,
      }
    );
    return { orderId: order.id };
  }

  /**
   * 判断商品库存是否充足
   * @param orderId
   * @returns
   */
  async getInventory(goods) {
    const goodsSpecs = await this.goodsSpecsInfoEntity.findOne({
      keyId: JSON.stringify(goods.specs),
      goodsId: goods.goodsId,
    });

    if (goodsSpecs.inventory < goods.goodsCount) {
      const goodsName = await this.goodsInfoEntity.findOne({
        id: goodsSpecs.goodsId,
      });
      throw new CoolCommException(
        ` ${goodsName.title}  ${goodsSpecs.name}  库存不足`
      );
    }
  }

  /**
   * 获取当前用户的订单
   * @param userId
   */
  async count(userId: number) {
    // 获得所有订单
    const result = {};
    // 待付款
    result['toBePaid'] = await this.orderInfoEntity.count({
      status: 0,
      userId,
    });
    // 待发货
    result['undelivered'] = await this.orderInfoEntity.count({
      status: 1,
      userId,
    });
    // 待收货
    result['toBeReceived'] = await this.orderInfoEntity.count({
      status: 2,
      userId,
    });
    // 待评价
    result['toBeEvaluated'] = await this.orderInfoEntity.count({
      status: 3,
      userId,
    });
    return result;
  }

  /**
   * 获得所有订单
   */
  async orderAll() {
    const result = {};
    // 待发货
    result['undelivered'] = await this.orderInfoEntity.count({
      status: 1,
    });
    // 待收货
    result['toBeReceived'] = await this.orderInfoEntity.count({
      status: 2,
    });
    // 待评价
    result['toBeEvaluated'] = await this.orderInfoEntity.count({
      status: 3,
    });
    // 待处理
    result['toBeProcessed'] = await this.orderGoodsEntity.count({
      status: 1,
    });

    // 已付
    const orderList = await this.nativeQuery(
      `
      SELECT
	    SUM( order_info.price ) AS total,
    	COUNT( order_info.id ) AS count 
    FROM
    	order_info 
    WHERE
    	order_info.status IN (1,2,3,4)`
    );
    const { total, count } = orderList[0];
    result['count'] = count ? count : 0;
    result['total'] = total ? total : 0;

    // 当天
    const dayOrderList = await this.nativeQuery(
      `
      SELECT
	    SUM( order_info.price ) AS dayTotal,
    	COUNT( order_info.id ) AS dayCount 
    FROM
	    order_info 
    WHERE
      to_days(order_info.createTime)= to_days(now())
    and
	    order_info.status IN (1,2,3,4)`
    );
    const { dayTotal, dayCount } = dayOrderList[0];

    result['dayTotal'] = dayTotal ? dayTotal : 0;
    result['dayCount'] = dayCount ? dayCount : 0;
    return result;
  }
}

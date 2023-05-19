import { Inject, Provide } from '@midwayjs/decorator';
import {
  BaseService,
  CoolCommException,
  CoolTransaction,
} from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository, QueryRunner } from 'typeorm';
import { OrderGoodsEntity } from '../entity/goods';
import { OrderInfoEntity } from '../entity/info';
import { OrderPayService } from './pay';
import { MarketCouponsUserEntity } from '../../market/entity/coupons/couponsUser';

/**
 * 订单商品
 */
@Provide()
export class OrderGoodsService extends BaseService {
  @InjectEntityModel(OrderGoodsEntity)
  orderGoodsEntity: Repository<OrderGoodsEntity>;

  @InjectEntityModel(OrderInfoEntity)
  orderInfoEntity: Repository<OrderInfoEntity>;

  @InjectEntityModel(MarketCouponsUserEntity)
  marketCouponsUserEntity: Repository<MarketCouponsUserEntity>;

  @Inject()
  orderPayService: OrderPayService;

  /**
   * 分页查询
   * @param query
   */
  async page(query) {
    const { status, keyWord, startTime, endTime } = query;
    const sql = `SELECT
            a.*,
            b.orderNum
        FROM
            order_goods a
            LEFT JOIN order_info b ON a.orderId = b.id
        WHERE 1=1
        ${this.setSql(status, 'and a.status = ?', [status])}
        ${this.setSql(keyWord, 'and (a.title like ? or a.id like ?)', [
          `%${keyWord}%`,
          `%${keyWord}%`,
        ])}
        ${this.setSql(startTime, 'AND a.createTime >= ?', [startTime])}
        ${this.setSql(endTime, 'AND a.createTime <= ?', [endTime])}
        ${this.setSql(true, 'and a.status in (?)', [[1, 2, 3]])}`;

    return this.sqlRenderPage(sql, query);
  }
  /**
   * 同意退款
   * @param id
   */
  @CoolTransaction({ isolation: 'SERIALIZABLE' })
  async agreeRefund(id: number, queryRunner?: QueryRunner) {
    const info = await queryRunner.manager.findOne<OrderGoodsEntity>(
      OrderGoodsEntity,
      { id }
    );
    if (info && info.status == 1) {
      // 操作退款
      if (info.refundAmount > 0) {
        await this.orderPayService.refund(id);
      }
      info.status = 2;
      info.refundTime = new Date();
      await queryRunner.manager.update<OrderGoodsEntity>(
        OrderGoodsEntity,
        id,
        info
      );
      // 判断所有都退款了关闭订单
      const infos = await queryRunner.manager.find<OrderGoodsEntity>(
        OrderGoodsEntity,
        {
          orderId: info.orderId,
          status: 0,
        }
      );
      if (infos.length == 0) {
        await queryRunner.manager.update<OrderInfoEntity>(
          OrderInfoEntity,
          info.orderId,
          {
            status: 5,
            cancelReason: '退款成功，关闭订单',
          }
        );

        const order = await queryRunner.manager.findOne<OrderInfoEntity>(
          OrderInfoEntity,
          { id: info.orderId }
        );
        if (info.goodsCount) {
          // 返回优惠券
          await this.marketCouponsUserEntity.update(
            { couponsId: order.couponsId, userId: order.userId },
            { status: 1 }
          );
        }
      }
    } else {
      throw new CoolCommException('不是可以退款的状态');
    }
  }

  /**
   * 拒绝退款
   * @param id
   * @param reason
   */
  async rejectRefund(id, reason) {
    const info = await this.orderGoodsEntity.findOne({ id });
    if (info && info.status == 1) {
      info.status = 3;
      info.refundRejectReason = reason;
      await this.orderGoodsEntity.update(id, info);
    } else {
      throw new CoolCommException('不是可以拒绝退款的状态');
    }
  }
  /**
   * 售后列表
   * @param userId
   */
  async aftersale(query, userId) {
    const sql = `SELECT
          a.*,
      b.orderNum
      FROM
          order_goods a
          LEFT JOIN order_info b ON a.orderId = b.id
      WHERE a.status in (1,2,3)
      ${this.setSql(userId, 'and a.userId = ?', [userId])}`;
    return this.sqlRenderPage(sql, query);
  }
}

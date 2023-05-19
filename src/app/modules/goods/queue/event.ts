import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { CoolEvent, Event } from '@cool-midway/core';
import { GoodsInfoEntity } from '../entity/info';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/orm';
import { OrderGoodsEntity } from '../../order/entity/goods';
import { GoodsSpecsInfoEntity } from '../entity/specs/info';
import { GoodsCommentEntity } from '../entity/comment';
import { MoreThanOrEqual } from 'typeorm';

/**
 * 接收事件
 */
@Provide()
@Scope(ScopeEnum.Singleton)
@CoolEvent()
export class GoodsEventController {
  @InjectEntityModel(GoodsInfoEntity)
  goodsInfoEntity: Repository<GoodsInfoEntity>;

  @InjectEntityModel(GoodsSpecsInfoEntity)
  goodsSpecsInfoEntity: Repository<GoodsSpecsInfoEntity>;

  @InjectEntityModel(OrderGoodsEntity)
  orderGoodsEntity: Repository<OrderGoodsEntity>;

  @InjectEntityModel(GoodsCommentEntity)
  goodsCommentEntity: Repository<GoodsCommentEntity>;
  /**
   * 订单关闭商品数量回滚事件
   * @param msg
   * @param a
   */
  @Event('orderClose')
  async orderClose(orderId) {
    // 根据订单id查询订单商品
    const orderGoods = await this.orderGoodsEntity.find({ orderId });
    for (const order of orderGoods) {
      // 修改规格里面的库存
      await this.goodsSpecsInfoEntity.update(
        { keyId: order.specs },
        { inventory: () => `inventory+${order.goodsCount}` }
        //修改商品已售
      );
      await this.goodsInfoEntity.update(
        { id: order.goodsId },
        {
          sales: () => `sales - ${order.goodsCount}`,
          inventory: () => `inventory+${order.goodsCount}`,
        }
      );
    }
  }
  /**
   * 提交订单商品数量修改事件
   * @param msg
   * @param a
   */
  @Event('orderSubmit')
  async orderSubmit(goods: OrderGoodsEntity) {
    // 修改规格里面的库存
    await this.goodsSpecsInfoEntity.update(
      { keyId: goods.specs },
      { inventory: () => `inventory-${goods.goodsCount}` }
      //修改商品已售
    );
    await this.goodsInfoEntity.update(
      { id: goods.goodsId },
      {
        sales: () => `sales + ${goods.goodsCount}`,
        inventory: () => `inventory-${goods.goodsCount}`,
      }
    );
  }

  /**
   *
   * @param goodsId 商品评论修改事件
   */
  @Event('insertComment')
  async insertComment(goodsId) {
    // // 根据评论商品查询商品
    const starTotal = await this.goodsCommentEntity.count({
      goodsId,
    });
    const count = await this.goodsCommentEntity.count({
      goodsId,
      starCount: MoreThanOrEqual(4),
    });

    await this.goodsInfoEntity.update(
      { id: goodsId },
      { score: Number(((count / starTotal) * 100).toFixed(2)) }
    );
  }
}

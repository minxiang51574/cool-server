import { Provide, Inject } from '@midwayjs/decorator';
import { BaseService, CoolEventManager } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository, In } from 'typeorm';
import { GoodsCommentEntity } from '../entity/comment';
import { Context } from 'egg';
import { OrderInfoEntity } from '../../order/entity/info';

/**
 * 描述
 */
@Provide()
export class GoodsCommentService extends BaseService {
  @InjectEntityModel(GoodsCommentEntity)
  goodsCommentEntity: Repository<GoodsCommentEntity>;
  @InjectEntityModel(OrderInfoEntity)
  orderInfoEntity: Repository<OrderInfoEntity>;

  @Inject()
  ctx: Context;

  @Inject('cool:coolEventManager')
  coolEventManager: CoolEventManager;
  /**
   * 批量添加商品评论
   */
  async batch(query) {
    for (const comment of query) {
      comment['userId'] = this.ctx.user.id;
      await this.goodsCommentEntity.insert(comment);
      // 修改当前订单为已完成
      await this.orderInfoEntity.update({ id: comment.orderId }, { status: 4 });
      this.coolEventManager.emit('insertComment', comment.goodsId);
    }
  }
  async delete(ids: []) {
    const comment = await this.goodsCommentEntity.find({ id: In(ids) });
    await this.goodsCommentEntity.delete({ id: In(ids) });
    for (const iterator of comment) {
      this.coolEventManager.emit('insertComment', iterator.goodsId);
    }
  }
}

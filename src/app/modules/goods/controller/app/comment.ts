import { Body, Inject, Post, Provide, ALL } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoEntity } from '../../../user/entity/info';
import { GoodsCommentEntity } from '../../entity/comment';
import { GoodsCommentService } from '../../service/comment';
import { Context } from 'egg';

/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: GoodsCommentEntity,
  service: GoodsCommentService,
  pageQueryOp: {
    select: ['a.*, b.headimgurl, b.nickname, b.sex'],
    leftJoin: [
      {
        entity: UserInfoEntity,
        alias: 'b',
        condition: 'a.userId = b.id',
      },
    ],
    where: async (ctx: Context) => {
      return [
        // 状态为上架
        ['a.goodsId = :goodsId', { goodsId: ctx.request.body.goodsId }],
      ];
    },
  },
})
export class GoodsCommenController extends BaseController {
  @Inject()
  goodsCommentService: GoodsCommentService;
  /**
   * 批量添加商品评论
   */
  @Post('/batch')
  async batch(@Body(ALL) query) {
    return this.ok(await this.goodsCommentService.batch(query));
  }
}

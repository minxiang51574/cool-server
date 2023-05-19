import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoEntity } from '../../../user/entity/info';
import { GoodsCommentEntity } from '../../entity/comment';
import { GoodsInfoEntity } from '../../entity/info';
import { GoodsCommentService } from '../../service/comment';

/**
 * 评论
 */
@Provide()
@CoolController({
  api: ['page', 'delete'],
  entity: GoodsCommentEntity,
  service: GoodsCommentService,
  pageQueryOp: {
    keyWordLikeFields: ['a.content', 'b.nickname', 'c.title'],
    select: ['a.*, b.nickname, c.title, c.pic '],
    leftJoin: [
      {
        alias: 'b',
        condition: 'a.userId = b.id',
        entity: UserInfoEntity,
      },
      {
        alias: 'c',
        condition: 'a.goodsId = c.id',
        entity: GoodsInfoEntity,
      },
    ],
  },
})
export class AdminGoodsCommentController extends BaseController {}

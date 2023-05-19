import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { GoodsInfoEntity } from '../../entity/info';
import { GoodsInfoService } from '../../service/info';

/**
 * 商品
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: GoodsInfoEntity,
  service: GoodsInfoService,
  pageQueryOp: {
    keyWordLikeFields: ['title', 'subTitle', 'keywords', 'a.id'],
    fieldEq: ['status'],
    // // 增加其他条件
    // where: async (ctx: Context) => {
    //   return [
    //     // 状态为上架
    //     ['a.status = :status', { status: 1 }],
    //   ];
    // },
  },
})
export class AdminGoodsInfoController extends BaseController {}

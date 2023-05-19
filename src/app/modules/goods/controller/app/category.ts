import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { GoodsCategoryEntity } from '../../entity/category';

/**
 * 分类
 */
@Provide()
@CoolController({
  api: ['list'],
  entity: GoodsCategoryEntity,
  listQueryOp: {
    addOrderBy: {
      sortNum: 'desc',
    },
  },
})
export class AppGoodsCategoryController extends BaseController {}

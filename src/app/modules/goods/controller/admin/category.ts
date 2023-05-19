import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { GoodsCategoryEntity } from '../../entity/category';

/**
 * 分类
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: GoodsCategoryEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name', 'id'],
  },
  listQueryOp: {
    keyWordLikeFields: ['name'],
  },
})
export class AdminGoodsCategoryController extends BaseController {}

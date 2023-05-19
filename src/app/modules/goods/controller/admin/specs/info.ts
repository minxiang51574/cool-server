import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { GoodsSpecsInfoEntity } from '../../../entity/specs/info';

/**
 * 规格
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: GoodsSpecsInfoEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name'],
  },
})
export class AdminGoodsSpecsInfoController extends BaseController {}

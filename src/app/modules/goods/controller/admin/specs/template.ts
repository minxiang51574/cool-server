import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { GoodsSpecsTemplateEntity } from '../../../entity/specs/template';

/**
 * 商品规格模板
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: GoodsSpecsTemplateEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name'],
  },
  // 操作之前，将前端的数据转JSON格式存数据库
  before: ctx => {
    const { data } = ctx.request.body;
    ctx.request.body.data = JSON.stringify(data);
  },
})
export class GoodsSpecsTemplateController extends BaseController {}

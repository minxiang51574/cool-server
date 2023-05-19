import { Body, Inject, Post, Provide, ALL } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { GoodsInfoEntity } from '../../entity/info';
import { GoodsInfoService } from '../../service/info';

/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: GoodsInfoEntity,
  service: GoodsInfoService,
})
export class GoodsInfoController extends BaseController {
  @Inject()
  goodsInfoService: GoodsInfoService;

  @Post('/search')
  async search(@Body(ALL) query: any) {
    return this.ok(await this.goodsInfoService.search(query));
  }
}

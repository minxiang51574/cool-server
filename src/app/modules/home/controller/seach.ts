import { Get, Inject, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { HomeSeachService } from '../service/search';

/**
 * 描述
 */
@Provide()
@CoolController('/admin/seach')
export class UPageHomeSeachController extends BaseController {
  @Inject()
  homeSeachService: HomeSeachService;
  /**
   * 获得搜索内容的次数
   */
  @Get('/seachAll')
  async seachAll() {
    return this.ok(await this.homeSeachService.seachAll());
  }
}

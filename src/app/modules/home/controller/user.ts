import { Get, Inject, Provide, Query } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { UserHomeService } from '../service/user';

/**
 * 首页统计
 */
@Provide()
@CoolController('/admin/userHome')
export class UserHomeController extends BaseController {
  @Inject()
  userHomeService: UserHomeService;

  /**
   * 用户走势图
   * @param dayCount 最近几天
   * @returns
   */
  @Get('/userChart')
  async userChart(@Query() dayCount) {
    return this.ok(await this.userHomeService.userChart(dayCount));
  }

  // 获得总用户
  @Get('/userTotal')
  async userTotal() {
    return this.ok(await this.userHomeService.userTotal());
  }
}

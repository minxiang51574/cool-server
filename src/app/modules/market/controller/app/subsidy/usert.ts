import { Body, Get, Inject, Post, Provide, Query } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { MarketSubsidyUserEntity } from '../../../entity/subsidy/user';
import { MarketSubsidyUserService } from '../../../service/subsidy/user';

/**
 * 补贴用户
 */
@Provide()
@CoolController({
  api: ['info'],
  entity: MarketSubsidyUserEntity,
  service: MarketSubsidyUserService,
})
export class AppMarketSubsidyUserController extends BaseController {
  @Inject()
  marketSubsidyUserService: MarketSubsidyUserService;

  @Inject()
  ctx;

  /**
   * 获得详情
   * @param activityId
   * @returns
   */
  @Get('/detail')
  async detail(@Query() activityId: number) {
    return this.ok(
      await this.marketSubsidyUserService.detail(this.ctx.user.id, activityId)
    );
  }

  /**
   * 领取
   * @param activityId
   * @returns
   */
  @Post('/receive')
  async receive(@Body() activityId: number) {
    await this.marketSubsidyUserService.receive(this.ctx.user.id, activityId);
    return this.ok();
  }
}

import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { MarketActivityInfoEntity } from '../../../entity/activity/info';
import { MarketActivityGoodsService } from '../../../service/activity/goods';

/**
 * 活动
 */
@Provide()
@CoolController({
  api: ['page'],
  entity: MarketActivityInfoEntity,
  service: MarketActivityGoodsService,
})
export class AppMarketActivityInfoController extends BaseController {}

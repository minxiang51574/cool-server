import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { MarketActivityInfoEntity } from '../../../entity/activity/info';
import { MarketActivityInfoService } from '../../../service/activity/info';

/**
 * 活动
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MarketActivityInfoEntity,
  service: MarketActivityInfoService,
  listQueryOp: {
    // 增加其他条件
    where: async ctx => {
      return [
        // 获得有效的活动(状态为1且未过期)
        [
          'status =:status and endTime >= NOW()',
          { status: 1 },
          ctx.request.body.isValid,
        ],
      ];
    },
  },
})
export class AdminMarketActivityInfoController extends BaseController {}

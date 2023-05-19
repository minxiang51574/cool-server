import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { ImSessionInfoEntity } from '../../entity/session/session';
import { ImSessionService } from '../../service/session';

/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info'],
  service: ImSessionService,
  entity: ImSessionInfoEntity,
  // 向表插入当前登录用户ID
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      userId: ctx.user.id,
    };
  },
})
export class imSessionController extends BaseController {}

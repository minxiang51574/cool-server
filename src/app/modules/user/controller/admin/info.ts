import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoEntity } from '../../entity/info';

/**
 * 用户
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: UserInfoEntity,
  pageQueryOp: {
    keyWordLikeFields: ['nickname', 'phone', 'labels', 'id'],
    fieldEq: ['status', 'source'],
  },
})
export class AdminUserInfoController extends BaseController {}

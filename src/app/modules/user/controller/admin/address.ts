import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { UserAddressEntity } from '../../entity/address';

/**
 * 地址
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: UserAddressEntity,
})
export class AdminUserAddressController extends BaseController {}

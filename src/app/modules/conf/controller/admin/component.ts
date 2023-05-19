import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { ConfComponentEntity } from '../../entity/component';
import { ConfComponentService } from '../../service/component';

/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ConfComponentEntity,
  service: ConfComponentService,
})
export class AdminConfComponentController extends BaseController {}

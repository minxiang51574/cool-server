import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { ConfPageEntity } from '../../entity/page';
import { ConfPageService } from '../../service/page';

/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ConfPageEntity,
  service: ConfPageService,
})
export class AdminConfPageController extends BaseController {}

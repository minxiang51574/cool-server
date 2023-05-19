import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { ConfPageEntity } from '../../entity/page';
import { ConfPageService } from '../../service/page';

/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['list'],
  entity: ConfPageEntity,
  service: ConfPageService,
})
export class ConfPageController extends BaseController {}

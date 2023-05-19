import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { ConfComponentEntity } from '../entity/component';

/**
 * 描述
 */
@Provide()
export class ConfComponentService extends BaseService {
  @InjectEntityModel(ConfComponentEntity)
  confComponentEntity: Repository<ConfComponentEntity>;
}

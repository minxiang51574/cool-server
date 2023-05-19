import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { ConfPageEntity } from '../entity/page';

/**
 * 描述
 */
@Provide()
export class ConfPageService extends BaseService {
  @InjectEntityModel(ConfPageEntity)
  confPageEntity: Repository<ConfPageEntity>;

  async list(query) {
    return await this.confPageEntity.find({ status: 1, path: query.path });
  }
}

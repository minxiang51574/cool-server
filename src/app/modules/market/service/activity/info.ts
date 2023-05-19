import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { MarketActivityInfoEntity } from '../../entity/activity/info';
import { MarketSubsidyConfEntity } from '../../entity/subsidy/conf';

/**
 * 活动信息
 */
@Provide()
export class MarketActivityInfoService extends BaseService {
  @InjectEntityModel(MarketActivityInfoEntity)
  marketActivityInfoEntity: Repository<MarketActivityInfoEntity>;

  @InjectEntityModel(MarketSubsidyConfEntity)
  marketSubsidyConfEntity: Repository<MarketSubsidyConfEntity>;

  /**
   * 修改之后
   * @param param
   */
  async modifyAfter(param) {
    const { conf, type, id } = param;
    // 补贴
    if (type == 0) {
      conf.activityId = id;
      await this.marketSubsidyConfEntity.save(conf);
    }
  }

  /**
   * 详情
   * @param id
   */
  async info(id) {
    const info = await this.marketActivityInfoEntity.findOne({ id });
    if (info) {
      if (info.type == 0) {
        info['conf'] = await this.marketSubsidyConfEntity.findOne({
          activityId: id,
        });
      }
    }
    return info;
  }
}

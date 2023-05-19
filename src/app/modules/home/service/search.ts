import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { GoodsSearchEntity } from '../../goods/entity/search';

/**
 * 描述
 */
@Provide()
export class HomeSeachService extends BaseService {
  @InjectEntityModel(GoodsSearchEntity)
  goodsSearchEntity: Repository<GoodsSearchEntity>;

  /**
   * 获得搜索内容的次数
   */
  async seachAll() {
    return this.nativeQuery(
      `SELECT
          id,
          goods_search.content,
          count(id) as count
      FROM
          goods_search
      GROUP BY
      goods_search.content 	ORDER BY count DESC LIMIT 0,10 `
    );
  }
}

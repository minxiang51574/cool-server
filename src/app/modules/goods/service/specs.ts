import { Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { GoodsSpecsInfoEntity } from '../entity/specs/info';
import { GoodsSpecsAttrEntity } from '../entity/specs/attr';

/**
 * 规格
 */
@Provide()
export class GoodsSpecsService extends BaseService {
  @InjectEntityModel(GoodsSpecsInfoEntity)
  goodsSpecsInfoEntity: Repository<GoodsSpecsInfoEntity>;

  @InjectEntityModel(GoodsSpecsAttrEntity)
  goodsSpecsAttrEntity: Repository<GoodsSpecsAttrEntity>;

  /**
   * 保存规格
   */
  async save(goodsId: number, specs) {
    // 删除原来的规格
    await this.goodsSpecsInfoEntity.delete({ goodsId });
    await this.goodsSpecsAttrEntity.delete({ goodsId });

    // 添加新规格
    const { sku, list } = specs;
    for (const key in sku) {
      await this.goodsSpecsAttrEntity.insert({
        goodsId,
        name: key,
        sku: JSON.stringify(sku[key]),
      });
    }

    for (const item of list) {
      item.goodsId = goodsId;
      item.keyId = JSON.stringify(item.keyId);
      await this.goodsSpecsInfoEntity.insert(item);
    }
    return {};
  }

  /**
   * 价格
   * @param goodsId
   * @param keyId
   * @returns
   */
  async price(goodsId, keyId) {
    const info = await this.goodsSpecsInfoEntity.findOne({ goodsId, keyId });
    if (!info) {
      throw new CoolCommException('该商品规格不存在');
    }
    return info.price;
  }
}

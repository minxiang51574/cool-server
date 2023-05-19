import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolEventManager } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { GoodsInfoEntity } from '../entity/info';
import { GoodsSpecsService } from './specs';
import { GoodsSpecsInfoEntity } from '../entity/specs/info';
import { GoodsSpecsAttrEntity } from '../entity/specs/attr';
import { GoodsSearchEntity } from '../entity/search';

/**
 * 商品信息
 */
@Provide()
export class GoodsInfoService extends BaseService {
  @InjectEntityModel(GoodsInfoEntity)
  goodsInfoEntity: Repository<GoodsInfoEntity>;

  @InjectEntityModel(GoodsSpecsInfoEntity)
  goodsSpecsInfoEntity: Repository<GoodsSpecsInfoEntity>;

  @InjectEntityModel(GoodsSpecsAttrEntity)
  goodsSpecsAttrEntity: Repository<GoodsSpecsAttrEntity>;

  @InjectEntityModel(GoodsSearchEntity)
  goodsSearchEntity: Repository<GoodsSearchEntity>;
  @Inject()
  goodsSpecsService: GoodsSpecsService;

  @Inject('cool:coolEventManager')
  coolEventManager: CoolEventManager;

  /**
   * 新增
   */
  async add(param) {
    const specs = param.specs;
    delete param.specs;
    for (let i = 0; i < specs.list.length - 1; i++) {
      for (let j = 0; j < specs.list.length - 1 - i; j++) {
        if (specs.list[j].price > specs.list[j + 1].price) {
          const temp = specs.list[j];
          specs.list[j] = specs.list[j + 1];
          specs.list[j + 1] = temp;
        }
      }
    }
    let inventory = 0;
    for (const iterator of specs.list) {
      inventory += iterator.inventory;
    }
    param['inventory'] = inventory;
    param['maxPrice'] = specs.list[0].price;
    param['minPrice'] = specs.list[specs.list.length - 1].price;
    param['pic'] = param.pics.split(',')[0];
    await this.goodsInfoEntity.insert(param);
    await this.goodsSpecsService.save(param.id, specs);
    await this.modifyAfter(param);
    return param.id;
  }

  /**
   * 修改
   * @param param
   * @returns
   */
  async update(param) {
    const specs = param.specs;
    delete param.specs;
    for (let i = 0; i < specs.list.length - 1; i++) {
      for (let j = 0; j < specs.list.length - 1 - i; j++) {
        if (specs.list[j].price > specs.list[j + 1].price) {
          const temp = specs.list[j];
          specs.list[j] = specs.list[j + 1];
          specs.list[j + 1] = temp;
        }
      }
    }
    let inventory = 0;
    for (const iterator of specs.list) {
      inventory += iterator.inventory;
    }
    param['inventory'] = inventory;
    param['minPrice'] = specs.list[0].price;
    param['maxPrice'] = specs.list[specs.list.length - 1].price;
    param['pic'] = param.pics.split(',')[0];
    await this.goodsInfoEntity.update({ id: param.id }, param);
    await this.goodsSpecsService.save(param.id, specs);
    await this.modifyAfter(param);
    return param.id;
  }

  async modifyAfter(param) {
    this.coolEventManager.emit('goodsStatus', param.id, param.status);
  }

  /**
   * 查询
   * @param id
   * @returns
   */
  async info(id: number) {
    // 查询当前商品
    const result = await this.goodsInfoEntity.findOne({ id });
    // 查询规格
    const list = await this.goodsSpecsInfoEntity.find({
      goodsId: id,
    });
    for (let i = 0; i < list.length; i++) {
      list[i].keyId = JSON.parse(list[i].keyId);
    }

    const sku = {};
    const skus = await this.goodsSpecsAttrEntity.find({
      goodsId: id,
    });
    for (const item of skus) {
      sku[item.name] = JSON.parse(item.sku);
    }
    // result['specs'] = {};
    result['specs'] = {
      sku,
      list,
    };

    return result;
  }
  /**
   * 搜索
   */
  async search(query: any) {
    const { keyWord, categoryIds, maxPrice, minPrice } = query;
    if (query.order == 'price') {
      query.order = 'minPrice';
    }
    if (keyWord) {
      this.goodsSearchEntity.insert({ content: keyWord });
    }
    const sql = `select * from goods_info g where 1=1
    ${this.setSql(
      keyWord,
      'and (g.title like ? or g.subTitle like ? or g.keywords like ?)',
      [`%${keyWord}%`, `%${keyWord}%`, `%${keyWord}%`]
    )}
    ${this.setSql(maxPrice, 'AND g.maxPrice <= ?', [maxPrice])}
    ${this.setSql(minPrice, 'AND g.minPrice >= ?', [minPrice])}
    ${this.setSql(categoryIds, 'and g.categoryId in (?)', [categoryIds])}
    and g.status = 1
    `;
    const goods = await this.sqlRenderPage(sql, query);

    return goods;
  }
}

import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository, In } from 'typeorm';
import { MarketCouponsInfoEntity } from '../../entity/coupons/info';
import { GoodsInfoEntity } from '../../../goods/entity/info';
import { GoodsCategoryEntity } from '../../../goods/entity/category';
import * as moment from 'moment';
import { MarketCouponsUserEntity } from '../../entity/coupons/couponsUser';
import { Context } from 'egg';

/**
 * 描述
 */
@Provide()
export class MarketCouponsInfoService extends BaseService {
  @InjectEntityModel(MarketCouponsInfoEntity)
  marketCouponsInfoEntity: Repository<MarketCouponsInfoEntity>;

  @InjectEntityModel(MarketCouponsUserEntity)
  marketCouponsUserEntity: Repository<MarketCouponsUserEntity>;

  @InjectEntityModel(GoodsInfoEntity)
  goodsInfoEntity: Repository<GoodsInfoEntity>;

  @InjectEntityModel(GoodsCategoryEntity)
  goodsCategoryEntity: Repository<GoodsCategoryEntity>;

  @Inject()
  ctx: Context;

  async page(query: any) {
    const { keyWord } = query;
    const sql = `
    SELECT
    *
    from
    market_coupons_info i
    where
    1=1
    ${this.setSql(keyWord, 'and i.name like ?', [`%${keyWord}%`])}
     `;
    const info = await this.sqlRenderPage(sql, query);
    let num = 0;
    for (const iterator of info.list) {
      let day: number;
      if (iterator.timeType == 0) {
        // 获得天数
        day = moment(iterator.endTime).diff(iterator.startTime, 'day');
        info.list[num]['day'] = day;
      }
      num++;
    }
    return info;
  }

  async list(query: any) {
    // const { goodsId, userId } = query;

    const { goodsId } = query;
    const userId = this.ctx?.user.id;
    // 查询所有优惠券
    const couponsList = await this.marketCouponsInfoEntity.find({
      open: 1,
      way: 0,
    });
    const coupons = [];
    // 查询该商品的类型
    const goods = await this.goodsInfoEntity.findOne({ id: goodsId });
    const category = await this.goodsCategoryEntity.findOne({
      id: goods.categoryId,
    });
    for (const iterator of couponsList) {
      // 查询当前用户是否领取该优惠券
      const user = await this.marketCouponsUserEntity.find({
        where: {
          couponsId: iterator.id,
          userId,
          status: In([2, 3]),
        },
      });
      const users = await this.marketCouponsUserEntity.findOne({
        where: {
          couponsId: iterator.id,
          userId,
          // status: In([2, 3]),
        },
      });
      const flag = users ? true : false;
      iterator['isGet'] = flag;
      try {
        await this.couponsGetIs(iterator.id, userId, false, true);
      } catch (error) {
        continue;
      }
      if (user.length == 0) {
        switch (iterator.type) {
          case 0:
            coupons.push(iterator);
            break;
          case 1:
            if (iterator.insider == String(category.id)) {
              coupons.push(iterator);
            }
            break;
          case 2:
            for (const i of iterator.insider.split(',')) {
              if (i == String(goodsId)) {
                coupons.push(iterator);
              }
            }
            break;
        }
      }
    }
    return coupons;
  }

  async info(id: number) {
    const info = await this.marketCouponsInfoEntity.findOne({ id });
    if (info.type == 2) {
      const goodsList = [];
      for (const i of info.insider.split(',')) {
        const goods = await this.goodsInfoEntity.findOne({
          id: Number(i),
          status: 1,
        });
        if (!goods) {
          continue;
        }
        goodsList.push(goods);
      }
      info['goodsList'] = goodsList;
    }
    return info;
  }

  /**
   * 领取优惠券
   * @param id
   *
   */
  async receive(couponsId: number, userId: number) {
    const coupons = await this.marketCouponsUserEntity.findOne({
      couponsId,
      userId,
    });
    await this.couponsGetIs(couponsId, userId);
    if (coupons) {
      // 修改当前券的状态
      await this.marketCouponsUserEntity.update(
        { id: coupons.id },
        { status: 1 }
      );
    } else {
      // 插入领券
      await this.marketCouponsUserEntity.insert({ couponsId, userId });
    }
    // 修改券的数量
    await this.marketCouponsInfoEntity.update(
      { id: couponsId },
      { getNum: () => 'getNum+1' }
    );
    return true;
  }

  /**
   * 优惠券领取判断
   * @param coupons 优惠券实体类
   * @param userId 用户id
   */
  async couponsGetIs(
    couponsId: number,
    userId: number,
    ifUser = true,
    ifStart = false
  ) {
    const coupons = await this.marketCouponsInfoEntity.findOne({
      id: couponsId,
      open: 1,
      way: 0,
    });
    if (!coupons) {
      throw new CoolCommException('请勿违规操作');
    }
    // 判断优惠券是否限量
    if (coupons.isLimited == 1) {
      if (coupons.limitedNum <= coupons.getNum) {
        throw new CoolCommException('优惠券已抢光');
      }
    }
    if (ifUser) {
      // 判断当前用户是否已领券
      const user = await this.marketCouponsUserEntity.findOne({
        couponsId: coupons.id,
        userId,
        status: 1,
      });
      if (user) {
        throw new CoolCommException('该用户已领取');
      }
    }
    // 判断优惠券是否到领取时间
    if (coupons.getTime == 0) {
      if (
        coupons.getStartTimeData > new Date() &&
        new Date() > coupons.getEndTimeData
      ) {
        throw new CoolCommException('未到领取时间或者已过领取时间');
      }
    }
    // 判断是否到活动时间
    if (ifStart) {
      if (coupons.startTime > new Date()) {
        throw new CoolCommException('未到使用时间');
      }
      if (new Date() > coupons.endTime) {
        await this.marketCouponsUserEntity.update({ couponsId }, { status: 3 });
        throw new CoolCommException('已过使用时间');
      }
    }
  }

  /**
   * 向用户发送固定优惠券
   * @param ids
   * @param userId
   */
  async sendIds(id: number, userIds: []) {
    // 向当前用户插入优惠券
    for (const userId of userIds) {
      // 查询用户是否拥有这种优惠券
      const coupons = await this.marketCouponsUserEntity.findOne({
        couponsId: id,
        userId,
      });
      if (coupons) {
        await this.marketCouponsUserEntity.delete({ id: coupons.id });
      }
      await this.couponsGetIs(id, userId);
      await this.marketCouponsUserEntity.insert({
        userId,
        couponsId: id,
      });
    }
  }
  /**
   * 根据id获取优惠券的领取记录
   * @param id
   */
  async getRecord(id: number) {
    const sql = `
    SELECT
    	u.nickname,
	    u.headimgurl,
    	cu.createTime ,
      cu.status
    FROM
  	market_cuopons_user cu
	  LEFT JOIN user_info u ON u.id = cu.userId
    where 1=1
    ${this.setSql(id, 'and cu.couponsId = ? ', id)}
    ORDER BY createTime DESC
    `;
    return this.nativeQuery(sql);
  }

  /**
   * 获取当前用户的优惠券
   * @param userId
   * @returns
   */
  async getCouponsByUserId(query: any) {
    const { userId } = query;
    return this.sqlRenderPage(
      `
      SELECT
      u.id as myId,
      	i.* 
      FROM
      	market_cuopons_user u 
      LEFT JOIN market_coupons_info i ON i.id = u.couponsId 
      WHERE
	      1 = 1 
      ${this.setSql(userId, '	AND u.userId =?', userId)}
      and u.status in (0,1,3)
    `,
      query
    );
  }
}

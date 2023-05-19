import { ALL, Config, Inject, Provide } from '@midwayjs/decorator';
import { IWebMiddleware, IMidwayWebNext } from '@midwayjs/web';
import { Context } from 'egg';
import { MarketActivityGoodsService } from '../service/activity/goods';
import * as _ from 'lodash';
import { MarketCouponsInfoService } from '../service/coupons/info';

/**
 * 营销
 */
@Provide()
export class MarketMiddleware implements IWebMiddleware {
  @Config(ALL)
  coolConfig;

  @Inject()
  marketActivityGoodsService: MarketActivityGoodsService;
  @Inject()
  marketCouponsInfoService: MarketCouponsInfoService;

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      let { url } = ctx;
      const { prefix } = this.coolConfig.cool.router;
      url = url.replace(prefix, '').split('?')[0];
      if (url == '/app/order/order/submit') {
        await this.marketActivityGoodsService.discountPrice(
          ctx.request.body.goods,
          ctx.user.id
        );
      }
      await next();
      // 商品列表 插入活动信息
      if (url == '/app/goods/info/search') {
        const goodsIds = ctx.body.data.list.map(e => {
          return e.id;
        });
        const activitys =
          await this.marketActivityGoodsService.activitysByGoodsIds(goodsIds);
        ctx.body.data.list.forEach(item => {
          item['activitys'] =
            _.filter(activitys, { goodsId: String(item.id) }) || [];
        });
      }
      // 插入活动信息
      if (url == '/app/goods/info/info') {
        const activitys =
          await this.marketActivityGoodsService.activitysByGoodsIds([
            ctx.body.data.id,
          ]);
        if (!_.isEmpty(activitys)) {
          ctx.body.data['activitys'] = activitys;
        }
        // const coupons = await this.marketCouponsInfoService.list({
        //   goodsId: ctx.body.data.id,
        // });
        // if (!_.isEmpty(coupons)) {
        //   ctx.body.data['coupons'] = true;
        // } else {
        //   ctx.body.data['coupons'] = false;
        // }
      }
    };
  }
}

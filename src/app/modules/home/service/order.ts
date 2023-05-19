import { Provide, Inject } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { Utils } from '../../../comm/utils';

/**
 * 描述
 */
@Provide()
export class OrderHomeService extends BaseService {
  @Inject()
  utils: Utils;

  /**
   * 日金额走势
   */
  async orderDayChart(dayCount = 14) {
    const result = {
      datas: [],
      dates: [],
    };
    const dates = await this.utils.getRecentlyDates(dayCount);
    const count = await this.nativeQuery(
      `SELECT
            sum(a.price) as price,
            count( a.id ) AS count,
            LEFT ( a.createTime, 10 ) AS time
        FROM
        order_info a
        WHERE
            DATE_SUB( CURDATE( ), INTERVAL ? DAY ) <= a.createTime and a.status in (1,2,3,4)
        GROUP BY
            LEFT ( a.createTime, 10 )`,
      [dayCount]
    );
    let total = 0;
    let dayOrder = 0;
    dates.forEach(date => {
      let data = 0;
      dayOrder = 0;
      for (const item of count) {
        if (date === item.time) {
          data = item.price;
          total += parseInt(item.price);
          dayOrder = parseInt(item.price);
          break;
        }
        // dayOrder = 0;
      }
      result.dates.push(date.substring(5, 10));
      result.datas.push(data);
    });
    return { total, dayOrder, ...result };
  }

  /**
   * 查询购买商品的排行
   */
  async goodsbuyNum() {
    return this.nativeQuery(`
    SELECT
	      a.title,
      	count( a.goodsId ) AS count 
    FROM
       	order_goods a 
    GROUP BY
	      a.goodsId
  	ORDER BY 
        count desc LIMIT 0,7
    `);
  }

  /**
   * 获得购买的商品类型
   * @param query
   * @returns
   */
  async getType(query: any) {
    return await this.sqlRenderPage(
      `
      SELECT
      c.name,
      a.createTime,
      count( a.id ) AS count 
    FROM
      order_goods a
      LEFT JOIN goods_info b ON a.goodsId = b.id
      LEFT JOIN goods_category c ON b.categoryId = c.id 
    WHERE
      a.STATUS = 0 
    GROUP BY
      c.name
    `,
      query
    );
  }
}

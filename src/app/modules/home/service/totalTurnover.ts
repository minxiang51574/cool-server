import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { Utils } from '../../../comm/utils';
import * as moment from 'moment';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { OrderInfoEntity } from '../../order/entity/info';

/**
 * 总收入
 */
@Provide()
export class ToralTurnoverService extends BaseService {
  @Inject()
  utils: Utils;

  @InjectEntityModel(OrderInfoEntity)
  orderInfoEntity: Repository<OrderInfoEntity>;
  /**
   * 总收入和年收入
   */
  async getVipToral() {
    const sql = `
    SELECT
	    sum(o.price) as total
    FROM
    	order_info o 
    WHERE
	    o.status in (1,2,3,4) `;
    const list = await this.nativeQuery(sql);
    // 获得今年的开始日期
    const startDate = moment()
      .year(moment().year())
      .startOf('year')
      .format('YYYY-MM-DD');
    // 获得当前时间
    const newTime = new Date(
      new Date(new Date().toLocaleDateString()).getTime()
    );
    // 获得过去了几天
    // 获得剩余天数
    const day = moment(newTime).diff(startDate, 'day');
    //查询这几天的营业额
    // 获得最近一周的营业额
    const yearTotal = await this.nativeQuery(
      `SELECT
          sum(price) as price
      FROM
          order_info a
      WHERE
          DATE_SUB( CURDATE( ), INTERVAL ? DAY ) <= a.createTime and a.status in (1,2,3,4)
     `,
      [day + 1]
    );
    const data = {};
    data['total'] = list[0].total;
    data['yearTotal'] = yearTotal[0].price;
    return data;
    // return list[0].total;
  }

  /**
   * 获得周同比
   */
  async getWeekMoney() {
    // 获得最近一周的营业额
    const oneWeekTotal = await this.nativeQuery(
      `SELECT
          sum(price) as price
      FROM
          order_info a
      WHERE
          DATE_SUB( CURDATE( ), INTERVAL ? DAY ) <= a.createTime and a.status in (1,2,3,4)
     `,
      [7]
    );

    // 获得最近两周的营业额
    const towWeekTotal = await this.nativeQuery(
      `SELECT
            sum(price) as price
        FROM
            order_info a
        WHERE
            DATE_SUB( CURDATE( ), INTERVAL ? DAY ) <= a.createTime and a.status in (1,2,3,4)
      `,
      [14]
    );

    const oneWeekMoney = oneWeekTotal[0].price ? oneWeekTotal[0].price : 0;
    let towWeekMonet = towWeekTotal[0].price;
    towWeekMonet -= oneWeekMoney;
    let weetThan = 0;
    if (towWeekMonet != 0) {
      weetThan = (oneWeekMoney / towWeekMonet - 1) * 100;
      weetThan = parseFloat(weetThan.toFixed(2));
    } else if (oneWeekMoney != 0) {
      weetThan = 100;
    } else {
      weetThan = 0;
    }
    let showWeet = true;
    if (towWeekMonet > oneWeekMoney) {
      showWeet = false;
    }
    return { weetThan, showWeet };
  }

  /**
   * 获得日同比
   */
  async getDayMoney() {
    // 获得最近一天的营业额
    const money1 = await this.nativeQuery(
      `SELECT
          sum(a.price)  as price
      FROM
          order_info a
      WHERE
          DATE_SUB( CURDATE( ), INTERVAL ? DAY ) <= a.createTime and a.status in (1,2,3,4)
     `,
      [0]
    );
    const oneDayTotal = money1[0].price ? money1[0].price : 0;
    // 获得最近两天的营业额
    const money2 = await this.nativeQuery(
      `SELECT
            sum(a.price) as price
        FROM
            order_info a
        WHERE
            DATE_SUB( CURDATE( ), INTERVAL ? DAY ) <= a.createTime and a.status in (1,2,3,4)
      `,
      [1]
    );
    let towDayTotal = money2[0].price ? money2[0].price : 0;
    towDayTotal -= oneDayTotal;

    let dayThan = 0;
    if (towDayTotal != 0) {
      dayThan = (oneDayTotal / towDayTotal - 1) * 100;
      dayThan = parseFloat(dayThan.toFixed(2));
    } else if (oneDayTotal != 0) {
      dayThan = 100;
    } else {
      dayThan = 0;
    }

    let showday = true;
    if (towDayTotal > oneDayTotal) {
      showday = false;
    }
    return { dayThan, showday, oneDayTotal };
  }

  /**
   * 订单走势
   */
  async orderChart(dayCount = 14) {
    const result = {
      datas: [],
      dates: [],
    };
    const dates = await this.utils.getRecentlyDates(dayCount);
    const count = await this.nativeQuery(
      `SELECT
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
    // const total = await this.orderInfoEntity.count({ status: 4 });
    const num = await this.nativeQuery(
      'SELECT count(o.id) as count from order_info o WHERE status in (1,2,3,4)'
    );
    let dayOrder = 0;
    dates.forEach(date => {
      let data = 0;
      dayOrder = 0;
      for (const item of count) {
        if (date === item.time) {
          data = item.count;
          // total += parseInt(item.count);
          dayOrder = parseInt(item.count);
          break;
        }
      }
      result.dates.push(date.substring(5, 10));
      result.datas.push(data);
    });
    return { total: num[0].count, dayOrder, ...result };
  }

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
   * 订单月走势
   */
  async orderMonthChart(dayCount = 14) {
    const result = {
      datas: [],
      dates: [],
      dataPrice: [],
    };
    const dates = await this.utils.getRecentlyMonths(dayCount);
    const count = await this.nativeQuery(
      `SELECT
            count( a.id ) AS count,
            LEFT ( a.createTime, 7 ) AS time,
            sum(a.price) as price
        FROM
            order_info a
        WHERE
            DATE_SUB( CURDATE( ), INTERVAL ? DAY ) <= a.createTime and a.status in (1,2,3,4)
        GROUP BY
            LEFT ( a.createTime, 7 )`,
      [365]
    );
    let price = 0;
    dates.forEach(date => {
      let data = 0;
      for (const item of count) {
        if (date === item.time) {
          data = item.count;
          price = item.price;
          break;
        }
      }
      result.dates.push(date.substring(5, 10) + '月');
      result.datas.push(data);
      result.dataPrice.push(price);
      price = 0;
    });
    return result;
  }
}

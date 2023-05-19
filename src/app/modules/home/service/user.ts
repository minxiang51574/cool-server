import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { Utils } from '../../../comm/utils';

/**
 * 首页统计
 */
@Provide()
export class UserHomeService extends BaseService {
  @Inject()
  utils: Utils;

  /**
   * 用户走势
   */
  async userChart(dayCount = 14) {
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
            user_info a
        WHERE
            DATE_SUB( CURDATE( ), INTERVAL ? DAY ) <= a.createTime
        GROUP BY
            LEFT ( a.createTime, 10 )`,
      [dayCount]
    );

    dates.forEach(date => {
      let data = 0;
      for (const item of count) {
        if (date === item.time) {
          data = item.count;
          break;
        }
      }
      result.dates.push(date.substring(5, 10));
      result.datas.push(data);
    });
    return result;
  }
  // 获得总用户
  async userTotal() {
    const data = await this.nativeQuery(
      `SELECT
      COUNT(id ) as total
    FROM
      user_info`
    );
    return data;
  }
}

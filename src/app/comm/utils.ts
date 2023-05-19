import { Inject, Provide } from '@midwayjs/decorator';
import * as ipdb from 'ipip-ipdb';
import * as _ from 'lodash';
import { Context } from 'egg';
import * as moment from 'moment';

/**
 * 帮助类
 */
@Provide()
export class Utils {
  @Inject()
  baseDir;

  /**
   * 获得请求IP
   */
  async getReqIP(ctx: Context) {
    const req = ctx.req;
    return (
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress.replace('::ffff:', '')
    );
  }

  /**
   * 根据IP获得请求地址
   * @param ip 为空时则为当前请求的IP地址
   */
  async getIpAddr(ctx: Context, ip?: string | string[]) {
    try {
      if (!ip) {
        ip = await this.getReqIP(ctx);
      }
      const bst = new ipdb.BaseStation(
        `${this.baseDir}/app/comm/ipipfree.ipdb`
      );
      const result = bst.findInfo(ip, 'CN');
      const addArr: any = [];
      if (result) {
        addArr.push(result.countryName);
        addArr.push(result.regionName);
        addArr.push(result.cityName);
        return _.uniq(addArr).join('');
      }
    } catch (err) {
      return '无法获取地址信息';
    }
  }

  /**
   * 去除对象的空值属性
   * @param obj
   */
  async removeEmptyP(obj) {
    Object.keys(obj).forEach(key => {
      if (obj[key] === null || obj[key] === '' || obj[key] === 'undefined') {
        delete obj[key];
      }
    });
  }

  /**
   * 线程阻塞毫秒数
   * @param ms
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获得最近几天的日期集合
   * @param recently
   */
  getRecentlyDates(recently, format = 'YYYY-MM-DD') {
    moment.locale('zh-cn');
    const dates = [];
    for (let i = 0; i < recently; i++) {
      dates.push(moment().subtract(i, 'days').format(format));
    }
    return dates.reverse();
  }
  /**
   * 获得最近几个月的月数
   * @param recently
   */
  getRecentlyMonths(recently, format = 'YYYY-MM') {
    moment.locale('zh-cn');
    const dates = [];
    const date = moment(Date.now()).format('YYYY-MM');
    for (let i = 0; i < recently; i++) {
      dates.push(moment(date).subtract(i, 'months').format(format));
    }
    return dates.reverse();
  }
}

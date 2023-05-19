import { Application } from 'egg';
import { ModuleConfig } from '@cool-midway/core';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 模块配置
 */
export default (app: Application) => {
  return {
    // 模块名称
    name: '订单',
    // 模块描述
    description: '订单管理、物流、支付',
    // 中间件
    middlewares: [],
    // 物流配置 阿里云市场 https://market.aliyun.com/products/56928004/cmapi021863.html?spm=5176.2020520132.101.1.4fb67218jwJXsx#sku=yuncode1586300000
    logistics: '',
    // 微信配置
    wx: {
      mp: {
        appid: '',
        secret: '',
      },
      // 支付配置
      pay: {
        partnerKey: '',
        mchid: '',
        notify_url:
          app.config.env == 'local'
            ? 'https://s42cpfq.hn3.mofasuidao.cn/app/order/pay/wxNotify'
            : 'https://mall.cool-js.com/api/app/order/pay/wxNotify',
        pfx: fs.readFileSync(
          path.join(
            app.baseDir,
            'app',
            'modules',
            'order',
            'certificate',
            'wx.p12'
          )
        ),
      },
    },
    // 用户模块的配置
    user: {
      // token
      token: {
        // 配置本模块忽略检验token的地址
        ignoreUrls: ['/app/order/pay/wxNotify'],
      },
    },
  } as ModuleConfig;
};

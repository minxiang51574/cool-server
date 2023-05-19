import { Application } from 'egg';
import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default (app: Application) => {
  return {
    // 模块名称
    name: '配置',
    // 模块描述
    description: '活动',
    // 中间件
    middlewares: [],
    // 用户模块的配置
    user: {
      // token
      token: {
        // 配置本模块忽略检验token的地址
        ignoreUrls: [
          '/app/activity/conf/page',
          '/app/activity/conf/info',
          '/app/activity/conf/list',
          '/app/conf/page/list',
        ],
      },
    },
    // 微信配置
    wx: {
      // 小程序
      mini: {
        appid: '',
        appsecret: '',
      },
      // 公众号
      mp: {
        appid: '',
        appsecret: '',
        // 模板消息
        msgNotify: '',
        // 模板消息的名称
        msgNotifyName: '商城',
        // 会话的URL
        sessionUrl: {
          local: 'https://upage.cool-js.com',
          prod: 'https://upage.cool-js.com',
        },
      },
      // app
      open: {},
    },
  } as ModuleConfig;
};

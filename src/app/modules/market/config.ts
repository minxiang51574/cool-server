import { Application } from 'egg';
import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default (app: Application) => {
  return {
    // 模块名称
    name: '营销',
    // 模块描述
    description: '如页面配置、活动等',
    // 中间件
    middlewares: [],
    // 全局中间件
    globalMiddlewares: ['marketMiddleware'],
    // 用户模块的配置
    user: {
      // token
      token: {
        // 配置本模块忽略检验token的地址
        ignoreUrls: [],
      },
    },
  } as ModuleConfig;
};

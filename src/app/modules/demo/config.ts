import { Application } from 'egg';
import { ModuleConfig } from '@cool-midway/core';

/**
 * 示例
 */
export default (app: Application) => {
  return {
    // 模块名称
    name: '测试模块',
    // 模块描述
    description: '演示示例',
    // 中间件
    middlewares: ['testMiddleware'],
    // 用户模块的配置
    user: {
      // token
      token: {
        // 配置本模块忽略检验token的地址
        ignoreUrls: ['/app/demo/pay/wx', '/app/demo/pay/info'],
      },
    },
  } as ModuleConfig;
};

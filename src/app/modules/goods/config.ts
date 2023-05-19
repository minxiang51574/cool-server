import { Application } from 'egg';
import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default (app: Application) => {
  return {
    // 模块名称
    name: '商品',
    // 模块描述
    description: '商品、评论、分类',
    // 中间件
    middlewares: [],
    // 用户模块的配置
    user: {
      // token
      token: {
        // 配置本模块忽略检验token的地址
        ignoreUrls: [
          '/app/goods/info/search',
          '/app/goods/info/info',
          '/app/goods/info/page',
          '/app/goods/comment/page',
          '/app/goods/category/list',
        ],
      },
    },
  } as ModuleConfig;
};

import { Application } from 'egg';
import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default (app: Application) => {
  return {
    // 模块名称
    name: '首页统计',
    // 模块描述
    description: '首页统计模块',
    // 中间件
    middlewares: [],
  } as ModuleConfig;
};

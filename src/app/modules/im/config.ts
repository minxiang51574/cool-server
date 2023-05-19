import { Application } from 'egg';
import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default (app: Application) => {
  return {
    // 模块名称
    name: '聊天',
    // 模块描述
    description: '聊天，依赖[user,base]模块',
    // 中间件
    middlewares: [],
  } as ModuleConfig;
};

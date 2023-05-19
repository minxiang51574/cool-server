import { Application } from 'egg';
import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default (app: Application) => {
  return {
    // 模块名称
    name: '用户',
    // 模块描述
    description: '用户登录、修改信息、地址信息等',
    // 中间件
    middlewares: [],
    // 全局中间件
    globalMiddlewares: ['userMiddleware'],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 1,
    // token
    token: {
      // 秘钥
      secret: 'cool-js.com',
      // token过期时间
      expiresIn: {
        // 2小时过期
        access: 2 * 3600,
        // token过期了用refresh token换取新的token
        refresh: 360 * 3600 * 24,
      },
      // 忽略token的地址
      ignoreUrls: [
        '/app/user/login/wxOpenLogin',
        '/app/user/login/wxMpLogin',
        '/app/user/login/wxMiniLogin',
        '/app/user/login/refreshToken',
        '/app/user/login/sendSms',
        '/app/user/login/phoneLogin',
        '/app/user/login/wxMpConfig',
        '/app/user/wachat/message-local',
      ],
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
        // 推送消息打开的链接
        sessionUrl: {
          local: 'https://mall.cool-js.com',
          prod: 'https://mall.cool-js.com',
        },
      },
      // app
      open: {},
    },
    // 阿里云短信
    sms: {
      signName: '',
      templateCode: ' ',
      accessKeyId: '',
      accessKeySecret: '',
    },
  } as ModuleConfig;
};

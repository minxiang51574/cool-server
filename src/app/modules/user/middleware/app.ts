import { ALL, Config, Init, Provide } from '@midwayjs/decorator';
import { IWebMiddleware, IMidwayWebNext } from '@midwayjs/web';
import { Context } from 'egg';
import { RESCODE } from '@cool-midway/core';
import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';

/**
 * 用户token校验
 */
@Provide()
export class UserMiddleware implements IWebMiddleware {
  @Config(ALL)
  coolConfig;

  @Config('module.user.token')
  tokenConfig;

  protected ignoreUrls = [];

  // 初始化忽略token的地址
  @Init()
  async init() {
    const { module } = this.coolConfig;
    for (const key in module) {
      if (key == 'user') {
        continue;
      }
      this.ignoreUrls = this.ignoreUrls.concat(
        module[key].user?.token?.ignoreUrls || []
      );
    }
  }

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      this.ignoreUrls = this.ignoreUrls.concat(this.tokenConfig.ignoreUrls);
      let { url } = ctx;
      const { prefix } = this.coolConfig.cool.router;
      url = url.replace(prefix, '').split('?')[0];
      if (_.startsWith(url, '/app/')) {
        const token = ctx.get('Authorization');
        if (ctx.method == 'OPTIONS') {
          ctx.status = 200;
          await next();
          return;
        }
        try {
          ctx.user = jwt.verify(token, this.tokenConfig.secret);
        } catch (error) {}
        if (this.ignoreUrls.includes(url)) {
          await next();
          return;
        } else {
          if (!ctx.user) {
            ctx.status = 401;
            ctx.body = {
              code: RESCODE.COMMFAIL,
              message: '登录失效~',
            };
            return;
          }
        }
      }
      await next();
    };
  }
}

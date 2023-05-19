import { Provide, Inject, App, Body, ALL, All } from '@midwayjs/decorator';
import { IMidwayWebApplication } from '@midwayjs/web';
import { UserWechatService } from '../../service/wechat';
import {
  CoolController,
  ICoolFile,
  BaseController,
  ICoolCache,
} from '@cool-midway/core';
/**
 * 微信前台接口
 */
@Provide()
@CoolController()
export class UserWachatController extends BaseController {
  @Inject('cool:file')
  coolFile: ICoolFile;

  @Inject('cool:cache')
  coolCache: ICoolCache;

  @Inject()
  ctx;

  @App()
  app: IMidwayWebApplication;

  @Inject()
  userWechatService: UserWechatService;

  /**
   * 微信消息-本地
   */
  @All('/message-local', {})
  async messageLocal(@Body(ALL) params: any) {
    if (this.app.getEnv() == 'local') {
      return this.userWechatService.wxMessage(params);
    }
    return null;
  }

  // /**
  //  * 微信消息
  //  */
  // @All('/message', {
  //   middleware: ['userCWechatMiddleware', 'userMWechatMiddleware'],
  // })
  // async message() {}
}

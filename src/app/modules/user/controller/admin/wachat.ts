import { Provide, Inject, Get } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { UserWechatService } from '../../service/wechat';

/**
 * 描述
 */
@Provide()
@CoolController()
export class AdminUserWachatController extends BaseController {
  @Inject()
  userWechatService: UserWechatService;

  /**
   * 获得微信二维码
   */
  @Get('/qrcode')
  async qrcode() {
    return this.ok(await this.userWechatService.qrcode());
  }
}

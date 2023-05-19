import { Body, Inject, Post, Provide, Get, Query } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { UserLoginService } from '../../service/login';
import { UserSmsService } from '../../service/sms';

/**
 * 登录
 */
@Provide()
@CoolController()
export class AppUserLoginController extends BaseController {
  @Inject()
  userLoginService: UserLoginService;

  @Inject()
  userSmsService: UserSmsService;
  /**
   * app微信登录
   * @param code 微信code
   * @returns
   */
  @Post('/wxOpenLogin')
  public async wxOpenLogin(@Body() code: string) {
    return this.ok(await this.userLoginService.wxOpenLogin(code));
  }

  /**
   * 微信公众号登录
   * @param code 微信code
   */
  @Post('/wxMpLogin')
  public async wxMpLogin(@Body() code: string) {
    return this.ok(await this.userLoginService.wxMpLogin(code));
  }

  /**
   * 微信小程序登录
   * @param code 微信code
   * @param encryptedData 微信加密数据
   * @param iv 微信加密相关
   */
  @Post('/wxMiniLogin')
  public async wxMiniLogin(
    @Body() code: string,
    @Body() encryptedData: string,
    @Body() iv: string
  ) {
    return this.ok(
      await this.userLoginService.wxMiniLogin(code, encryptedData, iv)
    );
  }
  /**
   * 获取验证码
   * @param phone
   * @returns
   */
  @Post('/sendSms')
  async sendSms(@Body() phone) {
    return this.ok(await this.userSmsService.sendSms(phone));
  }

  /**
   * 手机号登录
   * @param phone
   * @param code
   * @returns
   */
  @Post('/phoneLogin')
  async phoneLogin(@Body() phone, @Body() code) {
    return this.ok(await this.userSmsService.phoneLogin(phone, code));
  }

  /**
   * 刷新token
   * @param refreshToken token值
   * @returns
   */
  @Post('/refreshToken')
  public async refreshToken(@Body() refreshToken) {
    return this.ok(await this.userLoginService.refreshToken(refreshToken));
  }
  /**
   * 获得微信配置
   * @param appId
   * @param appSecret
   * @param url 当前网页的URL，不包含#及其后面部分(必须是调用JS接口页面的完整URL)
   */
  @Get('/wxMpConfig')
  public async getWxMpConfig(@Query() url: string) {
    return this.ok(await this.userLoginService.getWxMpConfig(url));
  }
}

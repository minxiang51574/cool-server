import { Body, Get, Inject, Post, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoEntity } from '../../entity/info';
import { UserInfoService } from '../../service/info';

/**
 * 用户
 */
@Provide()
@CoolController({
  api: ['update'],
  insertParam: ctx => {
    return {
      id: ctx.user.id,
    };
  },
  entity: UserInfoEntity,
})
export class AppUserInfoController extends BaseController {
  @Inject()
  userInfoService: UserInfoService;

  @Inject()
  ctx;

  /**
   * 获得个人信息
   * @returns
   */
  @Get('/person')
  async person() {
    return this.ok(await this.userInfoService.personal(this.ctx.user.id));
  }

  /**
   * 绑定小程序手机号码
   * @param code
   * @param encryptedData
   * @param iv
   * @returns
   */
  @Post('/bindMiniPhone')
  async bindMiniPhone(@Body() code, @Body() encryptedData, @Body() iv) {
    return this.ok(
      await this.userInfoService.bindMiniPhone(
        code,
        encryptedData,
        iv,
        this.ctx.user.id
      )
    );
  }
}

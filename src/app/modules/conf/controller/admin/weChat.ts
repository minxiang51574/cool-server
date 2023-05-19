import { Provide, Inject, Post, Body, Get } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { ConfWeChatService } from '../../service/wechat';

/**
 * 描述
 */
@Provide()
@CoolController()
export class AdminConfWeChatController extends BaseController {
  @Inject()
  confWeChatService: ConfWeChatService;
  /**
   * 创建更新菜单
   * @param data
   */
  @Post('/createMpMenu')
  public async createMpMenu(@Body() button) {
    return this.ok(await this.confWeChatService.createMpMenu(button));
  }

  /**
   * 查询菜单
   */
  @Get('/findMpMenu')
  public async findMpMenu() {
    return this.ok(await this.confWeChatService.findMpMenu());
  }

  /**
   * 清空菜单
   */
  @Get('/clearMpMenu')
  public async clearMpMenu() {
    return this.ok(await this.confWeChatService.clearMpMenu());
  }
}

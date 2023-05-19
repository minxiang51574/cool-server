import { Body, Inject, Post, Provide, Get } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { Context } from 'egg';
import { ImMessageEntity } from '../../entity/message';
import { ImMessageService } from '../../service/message';

/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['page'],
  entity: ImMessageEntity,
  service: ImMessageService,
})
export class imMessageController extends BaseController {
  @Inject()
  imMessageService: ImMessageService;

  @Inject()
  ctx: Context;

  /**
   * 已读
   * @param messageIds
   * @param sessionId
   * @returns
   */
  @Post('/read')
  async read(@Body() ids: number[], @Body() session: number) {
    this.imMessageService.read(ids, session, 1);
    return this.ok();
  }

  /**
   * 全部已读
   * @param messageIds
   * @param sessionId
   * @returns
   */
  @Post('/readAll')
  async readAll(@Body() sessionId: number) {
    this.imMessageService.readAll(sessionId, 1, this.ctx.user.id);
    return this.ok();
  }

  @Get('/count')
  async count() {
    return this.ok(await this.imMessageService.unCount(this.ctx.user.id));
  }
}

import { Body, Inject, Post, Provide } from '@midwayjs/decorator';
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
export class AdminImMessageController extends BaseController {
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
    this.imMessageService.read(ids, session, 0);
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
    this.imMessageService.readAll(sessionId, 0, this.ctx.admin.userId);
    return this.ok();
  }
}

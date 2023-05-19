import { Provide, Inject, Post, Body, ALL, Get } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { Context } from 'egg';
import { ImSessionInfoEntity } from '../../entity/session/session';
import { ImMessageService } from '../../service/message';
import { ImSessionService } from '../../service/session';
import { ImSessionUserEntity } from '../../entity/session/user';
// import { useEntityModel } from '@midwayjs/orm';

/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'page'],
  entity: ImSessionInfoEntity,
  service: ImSessionService,
  // 向表插入当前登录用户ID
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      userId: ctx.admin.userId,
    };
  },
})
export class AdminImSessionController extends BaseController {
  @Inject()
  imSessionService: ImSessionService;

  @Inject()
  imMessageService: ImMessageService;

  @Inject()
  ctx: Context;

  // /**
  //  * 已读
  //  * @param messageIds
  //  * @param sessionId
  //  * @returns
  //  */
  // @Post('/read')
  // async read(@Body() ids: number[], @Body() session: number) {
  //   this.imMessageService.read(ids, session, 1);
  //   return this.ok();
  // }

  // /**
  //  * 全部已读
  //  * @param messageIds
  //  * @param sessionId
  //  * @returns
  //  */
  // @Post('/readAll')
  // async readAll(@Body() sessionId: number) {
  //   this.imMessageService.readAll(sessionId, 1, this.ctx.admin.userId);
  //   return this.ok();
  // }

  @Post('/addCs')
  async addCs(@Body(ALL) query: ImSessionUserEntity) {
    return this.ok(await this.imSessionService.addCs(query));
  }
  @Get('/unreadCount')
  /**
   * 未读统计
   */
  async unreadCount() {
    return this.ok(await this.imMessageService.unCount(this.ctx.admin.userId));
  }
}

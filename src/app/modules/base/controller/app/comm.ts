import { Get, Inject, Post, Provide, Body, ALL } from '@midwayjs/decorator';
import { Context } from '@midwayjs/web';
import { CoolController, BaseController, ICoolFile } from '@cool-midway/core';

/**
 * 通用
 */
@Provide()
@CoolController()
export class BaseAppCommController extends BaseController {
  @Inject('cool:file')
  coolFile: ICoolFile;

  @Inject()
  ctx: Context;
  /**
   * 文件上传
   */
  @Post('/upload')
  async upload() {
    return this.ok(await this.coolFile.upload(this.ctx));
  }

  /**
   * 文件上传模式，本地或者云存储
   */
  @Get('/uploadMode')
  async uploadMode() {
    return this.ok(this.coolFile.getMode());
  }
  @Post('/random')
  async random(@Body(ALL) query) {
    return this.ok(query);
  }
}

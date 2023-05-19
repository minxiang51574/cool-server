import { Body, Inject, Post, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { BaseSysUserEntity } from '../../../entity/sys/user';
import { BaseSysUserService } from '../../../service/sys/user';

/**
 * 系统用户
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseSysUserEntity,
  service: BaseSysUserService,
})
export class BaseSysUserController extends BaseController {
  @Inject()
  baseSysUserService: BaseSysUserService;

  /**
   * 移动部门
   */
  @Post('/move')
  async move(@Body() departmentId: number, @Body() userIds: []) {
    await this.baseSysUserService.move(departmentId, userIds);
    return this.ok();
  }

  /**
   * 绑定微信修改场景值
   * @param id
   * @param sceneId
   */
  @Post('/updateScene')
  async updateScene(@Body() id, @Body() sceneId) {
    await this.baseSysUserService.updateScene(id, sceneId);
    return this.ok();
  }
}

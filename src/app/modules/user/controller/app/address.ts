import { Get, Inject, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { UserAddressEntity } from '../../entity/address';
import { UserAddressService } from '../../service/address';

/**
 * 地址
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: UserAddressEntity,
  service: UserAddressService,
  // 向表插入当前登录用户ID
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      userId: ctx.user.id,
    };
  },
  pageQueryOp: {
    where: async ctx => {
      return [['userId =:userId', { userId: ctx.user.id }]];
    },
  },
})
export class AppUserAddressController extends BaseController {
  @Inject()
  userAddressService: UserAddressService;

  @Inject()
  ctx;
  /**
   * 默认地址
   */
  @Get('/default')
  async default() {
    return this.ok(await this.userAddressService.default(this.ctx.user.id));
  }
}

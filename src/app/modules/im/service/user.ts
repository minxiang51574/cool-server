import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { ImUserEntity } from '../entity/user';
import { UserInfoEntity } from '../../user/entity/info';
import { BaseSysUserEntity } from '../../base/entity/sys/user';
import { v1 as uuid } from 'uuid';

/**
 * 用户
 */
@Provide()
export class ImUserService {
  @InjectEntityModel(ImUserEntity)
  imUserEntity: Repository<ImUserEntity>;

  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  /**
   * 新增
   * @param type
   * @param sendUserId
   * @param socketId
   */
  async add(type, sendUserId, socketId) {
    let check = await this.imUserEntity.findOne({ type, userId: sendUserId });
    let nickname, headimg, userInfo;
    // 后台
    if (type == 0) {
      userInfo = await this.baseSysUserEntity.findOne({
        id: sendUserId,
        isCs: 1,
      });
      if (!userInfo) {
        return;
      }
      nickname = userInfo?.name;
      userInfo['headimgurl'] = userInfo?.headImg;
      userInfo.nickname = userInfo.nickname ? userInfo.nickname : userInfo.name;
      headimg = userInfo.headImg;
      delete userInfo.headImg;
    }
    // 用户
    if (type == 1) {
      userInfo = await this.userInfoEntity.findOne({ id: sendUserId });
      nickname = userInfo?.nickname;
    }
    // 游客
    if (type == 2) {
      nickname = 'default';
      headimg = 'defaut';
      sendUserId = uuid();
    }
    if (!check) {
      check = new ImUserEntity();
      check.userId = sendUserId;
      check.type = type;
      check.socketId = socketId;
      check.nickname = nickname;
      check.headimg = headimg;
      await this.imUserEntity.insert(check);
    } else {
      delete userInfo.id;
      await this.imUserEntity.update(
        { id: check.id },
        {
          headimg: userInfo.headimgurl,
          nickname: userInfo.nickname,
          socketId: socketId,
        }
      );
    }
    return check;
  }
}

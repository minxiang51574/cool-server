import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { ImSessionInfoEntity } from '../entity/session/session';
import { Repository, In } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/orm';
import { ImSessionUserEntity } from '../entity/session/user';
import { ImUserEntity } from '../entity/user';
import { Context } from 'egg';
import { ImSocketEvent } from '../socket/event';

/**
 * 会话
 */
@Provide()
export class ImSessionService extends BaseService {
  @InjectEntityModel(ImSessionInfoEntity)
  imSessionInfoEntity: Repository<ImSessionInfoEntity>;

  @InjectEntityModel(ImSessionUserEntity)
  imSessionUserEntity: Repository<ImSessionUserEntity>;

  @InjectEntityModel(ImUserEntity)
  imUserEntity: Repository<ImUserEntity>;
  @Inject()
  imSocketEvent: ImSocketEvent;

  @Inject()
  ctx: Context;

  async delete(ids) {
    await this.imSessionInfoEntity.update({ id: In(ids) }, { status: 1 });
  }
  async page(query) {
    // 查询后台用户的信息
    const admin = await this.imUserEntity.findOne({
      userId: query.userId,
      type: 0,
    });
    // 查询当前客服的会话列表
    const sql = `
    SELECT
    s.*,
    m.content,
    m.contentType,
    u.headimg,
    u.nickname ,
    si.room
  FROM
    im_session_info s
    LEFT JOIN im_session_user si ON s.id = si.sessionId 
    AND si.objectType = 1
    LEFT JOIN im_message m ON s.lastContentId = m.id
    LEFT JOIN im_user u ON u.id = si.userId 
    LEFT JOIN im_session_user s2 ON s.id = s2.sessionId 
    AND s2.objectType = 0
  WHERE
  1=1 and s.status=0 
  ${this.setSql(admin, 'and s2.userId = ?', admin.id)} 
  
  `;
    const page = await this.sqlRenderPage(sql, query);
    return page;
  }

  async add(query) {
    const { sessionId, userId } = query;
    if (sessionId) {
      // 查询当前会话的客服用户是否在线
      const sessionAdmin = await this.imSessionUserEntity.findOne({
        sessionId,
        objectType: 0,
      });
      const objectUser = await this.imUserEntity.findOne({
        id: parseInt(sessionAdmin.userId),
      });
      const sockets = await this.imSocketEvent.io.fetchSockets();
      const flag = await this.imSocketEvent.online(
        objectUser.socketId,
        sockets
      );
      if (flag) {
        return { sessionId, room: `room${sessionId}`, ...objectUser };
      }
    }
    //查询当前用户的id
    const imUser = await this.imUserEntity.findOne({
      userId,
    });
    // 查询后台用户
    const objId = await this.random();
    const objectUser = await this.imUserEntity.findOne({
      id: objId,
    });
    // 查询该客服的会话信息
    const sessionList = await this.imSessionUserEntity.find({
      userId: String(objectUser.id),
      objectType: 0,
    });
    for (const i of sessionList) {
      // 查询当前会话的前端用户
      const appUser = await this.imSessionUserEntity.findOne({
        sessionId: i.sessionId,
        objectType: 1,
      });
      if (parseInt(appUser.userId) == imUser.id) {
        return {
          sessionId: i.sessionId,
          room: `room${i.sessionId}`,
          ...objectUser,
        };
      }
    }
    const session = new ImSessionInfoEntity();
    // 群聊
    session.type = 1;
    session.status = 0;
    await this.imSessionInfoEntity.insert(session);
    // 创建发送方会话
    await this.imSessionUserEntity.insert({
      userId: String(imUser.id),
      objectType: 1,
      sessionId: session.id,
      name: imUser.nickname,
      room: `room${session.id}`,
    });

    // 创建对象对话
    await this.imSessionUserEntity.insert({
      room: `room${session.id}`,
      userId: String(objectUser.id),
      objectType: 0,
      sessionId: session.id,
      name: objectUser.nickname,
    });

    return { sessionId: session.id, room: `room${session.id}`, ...objectUser };
  }

  /**
   * 随机获取客服信息
   */
  async random() {
    // 获得所有的客服
    const cs = await this.imUserEntity.find({ type: 0 });
    // 查询当前在线的Socket
    const sockets = await this.imSocketEvent.io.fetchSockets();
    // 获得在线的客服
    const csList = [];

    for (const i of cs) {
      if (await this.imSocketEvent.online(i.socketId, sockets)) {
        csList.push(i.id);
      }
    }
    let csId = 1;
    if (csList.length != 0) {
      //创建随机数
      const randomNum = parseInt(String(Math.random() * csList.length));
      csId = csList[randomNum];
    }
    return csId;
  }
  /**
   * 添加客服
   */
  async addCs(query: ImSessionUserEntity) {
    this.imSessionUserEntity.insert(query);
  }
}

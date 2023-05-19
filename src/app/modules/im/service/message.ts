import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolEventManager } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { ImMessageEntity } from '../entity/message';
import { ImSessionInfoEntity } from '../entity/session/session';
import { ImSessionUserEntity } from '../entity/session/user';
import { UserInfoEntity } from '../../user/entity/info';
import { ImSocketEvent } from '../socket/event';
import { ImUserEntity } from '../entity/user';
import { ImMessageUserEntity } from '../entity/umessge';
import { Context } from 'egg';

/**
 * 消息
 */
@Provide()
export class ImMessageService extends BaseService {
  @InjectEntityModel(ImMessageEntity)
  imMessageEntity: Repository<ImMessageEntity>;

  @InjectEntityModel(ImSessionInfoEntity)
  imSessionInfoEntity: Repository<ImSessionInfoEntity>;

  @InjectEntityModel(ImMessageUserEntity)
  imMessageUserEntity: Repository<ImMessageUserEntity>;

  @InjectEntityModel(ImSessionUserEntity)
  imSessionUserEntity: Repository<ImSessionUserEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(ImUserEntity)
  imUserEntity: Repository<ImUserEntity>;

  @Inject()
  imSocketEvent: ImSocketEvent;

  @Inject('cool:coolEventManager')
  coolEventManager: CoolEventManager;

  @Inject()
  ctx: Context;
  async page(query) {
    const { sessionId } = query;

    let userImId = 0;
    if (this.ctx.user) {
      const userIm = await this.imUserEntity.findOne({
        userId: this.ctx.user.id,
      });
      userImId = userIm.id;
    } else {
      // 查询当前用户的userId
      const session = await this.imSessionUserEntity.findOne({
        sessionId,
        objectType: 1,
      });
      const user = await this.imUserEntity.findOne({
        id: parseInt(session.userId),
      });
      userImId = user.id;
    }
    // 查询当前用户的所有会话id
    const sessionList = await this.imSessionUserEntity.find({
      userId: String(userImId),
      objectType: 1,
    });

    const sql = `SELECT
    msg.*,
    USER.nickname,
    USER.headimg 
  FROM
    im_message msg
    LEFT JOIN im_user USER ON msg.fromId = USER.id 
  WHERE
    1 = 1 
    ${this.setSql(sessionList.length != 0, ' and  msg.sessionId in (?)', [
      sessionList.map(e => {
        return e.sessionId;
      }),
    ])}
   `;
    return this.sqlRenderPage(sql, query);
  }
  /**
   * 保存与转发
   * @param sendSocketId 发送者的socketId
   * @param fromType 是否是后台
   * @param msg
   */
  // async saveAndSend(sendSocketId, msg: ImMessageEntity, fromType) {
  async saveAndSend(msg: ImMessageEntity, fromType) {
    const fromUser = await this.imUserEntity.findOne({
      id: parseInt(msg.fromId),
    });
    const sessionList = await this.imSessionUserEntity.find({
      sessionId: msg.sessionId,
    });
    //插入聊天信息
    const message = await this.imMessageEntity.insert(msg);
    sessionList.forEach(async e => {
      if (e.userId != String(msg.userId)) {
        const objectUser = await this.imUserEntity.findOne({
          id: parseInt(e.userId),
        });
        if (msg.type == 0) {
          //增加接收者的未读消息
          // const messageUser = await this.imMessageUserEntity.insert({
          await this.imMessageUserEntity.insert({
            sessionId: msg.sessionId,
            userId: String(objectUser.id),
            messageId: message.generatedMaps[0].id,
          });
        } else {
          //增加接收者的未读消息
          // const messageUser = await this.imMessageUserEntity.insert({
          await this.imMessageUserEntity.insert({
            sessionId: msg.sessionId,
            userId: String(fromUser.id),
            messageId: message.generatedMaps[0].id,
          });
        }
        // 查询当前用户的未读消息
        const count = await this.imMessageUserEntity.find({
          sessionId: msg.id,
          userId: e.userId,
          status: 0,
        });
        // 设置当前会话接受者的未读消息加一
        this.imSessionUserEntity.update(
          { userId: e.userId, sessionId: msg.sessionId },
          { unreadCount: count.length }
        );
      }
    });
    // 判断是否发送给后台
    if (msg.objectType != 1) {
      // 判断当前后台用户的socket是否在线
      const objectUser = await this.imSessionUserEntity.findOne({
        sessionId: msg.sessionId,
        objectType: 0,
      });
      const user = await this.imUserEntity.findOne({
        id: Number(objectUser.userId),
      });
      // 查询当前在线的Socket
      const sockets = await this.imSocketEvent.io.fetchSockets();
      // const boo = this.imSocketEvent.online(user.socketId, sockets);
      if (!(await this.imSocketEvent.online(user.socketId, sockets))) {
        this.coolEventManager.emit('pushAdmin', {
          adminId: user.userId,
          fromName: fromUser.nickname,
          ...msg,
        });
      }
    }
    // 没有会话ID，需要先创建会话
    if (!msg.sessionId) {
      await this.createSession(fromUser, msg, fromType);
    }
    // 修改会话消息的状态为正常
    await this.imSessionInfoEntity.update({ id: msg.sessionId }, { status: 0 });
    // 设置最后一条消息为该条信息
    this.imSessionInfoEntity.update(
      { id: msg.sessionId },
      { lastContentId: message.generatedMaps[0].id }
    );
    msg['nickname'] = fromUser.nickname;
    msg['headimg'] = fromUser.headimg;
    // // 向房间发送消息
    this.imSocketEvent.sendMessage(msg.room, msg);
  }

  /**
   * 创建会话
   * @param fromUser
   * @param objectUser
   * @param msg
   */
  async createSession(fromUser: ImUserEntity, msg: ImMessageEntity, fromType) {
    // 单聊
    const session = new ImSessionInfoEntity();
    session.type = 0;
    await this.imSessionInfoEntity.insert(session);
    msg.sessionId = session.id;
    // 创建发送方会话
    await this.imSessionUserEntity.insert({
      userId: msg.fromId,
      objectType: msg.objectType,
      sessionId: session.id,
      name: '在线客服',
    });
    // // 创建对象对话
    // await this.imSessionUserEntity.insert({
    //   userId: msg.objectId,
    //   objectType: fromType,
    //   sessionId: session.id,
    //   name: fromUser.nickname,
    // });
  }
  /**
   * 已读
   * @param messageIds
   * @param sessionId
   */
  async read(Ids: number[], sessionId: number, objectType: number) {
    const messageUser = await this.imMessageUserEntity
      .createQueryBuilder()
      .update()
      .set({ status: 1 })
      .where('sessionId =:sessionId', { sessionId })
      .andWhere('messageId in (:Ids)', { Ids })
      .execute();
    await this.imSessionUserEntity.update(
      { sessionId, objectType },
      { unreadCount: () => `unreadCount -${messageUser.affected}` }
    );
  }

  /**
   * 全部已读
   * @param messageIds
   * @param sessionId
   * @returns
   */
  async readAll(sessionId: number, objectType: number, userId: string) {
    await this.imMessageUserEntity.update({ sessionId, userId }, { status: 1 });
    await this.imSessionUserEntity.update(
      { sessionId, objectType },
      { unreadCount: 0 }
    );
  }

  /**
   * 未读统计
   */
  async unCount(userId: number) {
    // 根据id查询
    const user = await this.imUserEntity.findOne({ userId: String(userId) });
    const un = await this.nativeQuery(`
    SELECT
    sum( unreadCount )  as unreadCount
  FROM
    im_session_user 
  WHERE 1=1 
    ${this.setSql(user, 'and userId = ?', user?.id)} ;`);
    return un[0].unreadCount;
  }
}

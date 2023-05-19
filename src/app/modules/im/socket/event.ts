import { Config, Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import {
  BaseCoolSocketIO,
  CoolSocket,
  SocketEnvent,
} from '@cool-midway/socket';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { UserInfoService } from '../../user/service/info';
import { ImSessionService } from '../service/session';
import { ImMessageService } from '../service/message';
import { UserInfoEntity } from '../../user/entity/info';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { BaseSysUserEntity } from '../../base/entity/sys/user';
import { ImUserService } from '../service/user';
import * as _ from 'lodash';
// import * as socket from '@cool-midway/socket';
import { ImSessionUserEntity } from '../entity/session/user';
import { ImUserEntity } from '../entity/user';
import { CoolCommException } from '@cool-midway/core';

/**
 * socket的事件
 */
@Provide()
@Scope(ScopeEnum.Singleton)
@CoolSocket('/im')
export class ImSocketEvent extends BaseCoolSocketIO {
  // 获得模块的配置信息
  @Config('module.user.token')
  tokenConfig;

  // 获得模块的配置信息
  @Config('module.base.jwt')
  adminTokenConfig;

  @Inject()
  userInfoService: UserInfoService;

  @Inject()
  imSessionService: ImSessionService;

  @Inject()
  imMessageService: ImMessageService;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;

  @InjectEntityModel(ImSessionUserEntity)
  imSessionUserEntity: Repository<ImSessionUserEntity>;

  @InjectEntityModel(ImUserEntity)
  imUserEntity: Repository<ImUserEntity>;

  @Inject()
  imUserService: ImUserService;

  /**
   * 连接成功
   * @param data
   */
  @SocketEnvent()
  async connection(socket: Socket) {
    const { token, isAdmin } = socket.handshake.query;
    let tokenInfo, fromType, user;
    try {
      if (isAdmin) {
        // @ts-ignore
        tokenInfo = jwt.verify(token, this.adminTokenConfig.secret);
        user = await this.imUserService.add(0, tokenInfo.userId, socket.id);
        fromType = 0;
      } else {
        // @ts-ignore
        tokenInfo = jwt.verify(token, this.tokenConfig.secret);
        user = await this.imUserService.add(1, tokenInfo.id, socket.id);
        fromType = 1;
      }
    } catch (error) {
      // // 游客登录
      // await this.imUserService.add(2, null, socket.id);
      // // socket.emit('message', { sceneId: temp.userId });
      // fromType = 2;
      return;
    }
    socket.on('message', msg => {
      // if (msg.objectType == 1) {
      //   msg.fromId = user.userId;
      // } else {
      //   msg.fromId = user.id;
      // }
      if (!user) {
        throw new CoolCommException('对不起，您不是客服！');
      }
      msg.fromId = user.id;
      // 拉取房间操作
      this.roomOp(msg.sessionId, msg.room);
      this.imMessageService.saveAndSend(msg, fromType);
    });
  }
  /**
   * 根据sessionId拉取房间
   * @param msg
   */
  async roomOp(sessionId: number, room: string) {
    // 查询当前会话的用户
    const session = await this.imSessionUserEntity.find({
      sessionId,
    });

    const user = await this.imUserEntity.findByIds(
      session.map(e => {
        return e.userId;
      })
    );
    const socketIds = user.map(e => {
      return e.socketId;
    });
    // 拉到同一个房间
    await this.joinRoom(socketIds, room);
  }
  /**
   * 判断用户有没有在房间里
   * @param room
   * @param socketId
   */
  async inRoom(room, socketId) {
    const ids = await this.io.in(room).allSockets();
    return ids.has(socketId);
  }

  /**
   * 发送消息
   * @param room
   * @param msg
   */
  async sendMessage(room: string, msg) {
    this.io.to(room).emit('message', msg);
  }
  /**
   * 加入房间
   * @param socketIds
   * @param room
   */
  async joinRoom(socketIds, room) {
    this.io.to(socketIds).socketsJoin(room);

    // if (socketIds instanceof Array) {
    //   for (const socketId of socketIds) {
    //     const isInRoom = await this.inRoom(room, socketId);
    //     if (!isInRoom) {
    //       this.io.to(socketId).socketsJoin(room);
    //     }
    //   }
    // } else {
    //   if (!this.inRoom(room, socketIds)) {
    //     this.io.to(socketIds).socketsJoin(room);
    //   }
    // }
  }
  /**
   * 发送消息
   * @param room
   * @param msg
   */
  async send(socketId: string, msg: any) {
    this.io.to(socketId).emit('message', msg);
  }

  /**
   * 是否在线
   * @param socketId
   * @returns
   */
  async online(socketId: string, sockets) {
    if (!sockets) {
      sockets = await this.io.fetchSockets();
    }
    if (_.find(sockets, { id: socketId })) {
      return true;
    } else {
      return false;
    }
  }
}

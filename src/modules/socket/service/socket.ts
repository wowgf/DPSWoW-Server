import { App, Destroy, Init, Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { RedisService } from '@midwayjs/redis';
import { Application as SocketApplication } from '@midwayjs/socketio';
import { USER_SOCKET_MAP_KEY } from '../comm/const';

/**
 * 描述
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class SocketService extends BaseService {

  @Inject()
  redis: RedisService;

  @App('socketIO')
  socketApp: SocketApplication;

  // @Init()
  // async onApplicationShutdown() {
  //   console.log('应用启动，清理用户socket信息');
  //   await this.deleteKeysChild(USER_SOCKET_MAP_KEY);
  // }

  /**
   * 向客户端发送信息
   */
  async sendDataToClient(receiverId: number, data: any, emitType = 'message', namespace = 'client',) {
    // const socketId = await this.redis.hget(USER_SOCKET_MAP_KEY, receiverId.toString());
    const socketIds = await this.redis.lrange(`${USER_SOCKET_MAP_KEY}:${receiverId}`, 0, -1);
    const dataStr = JSON.stringify(data);
    console.log('=== 发送消息 === \n', dataStr);
    // 发送消息
    if (socketIds && socketIds.length > 0) {
      // this.socketApp.of(namespace).to(socketId).emit(emitType, dataStr);
      // 循环发送（好像无法指定给这几个广播）
      socketIds.forEach(socketId => {
        this.socketApp.of(namespace).to(socketId).emit(emitType, dataStr);
      });
    }
  }

  /**
   * 删除所有以 'key:' 开头的键
   */
  async deleteKeysChild(key: string) {
    const keys = await this.redis.keys(`${key}:*`);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }

  /**
   * 获取所有 key:下值的数量
   */
  async getKeysLength(key: string) {
    const keys = await this.redis.keys(`${key}:*`);
    return keys.length;
  }

  /**
   * 删除socket所有缓存
   */
  async deleteSocketCache() {
    await this.deleteKeysChild(USER_SOCKET_MAP_KEY);
  }

}

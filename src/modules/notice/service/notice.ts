import { App, Init, Inject, InjectClient, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeEntity } from '../entity/notice';
import { Application as SocketApplication } from '@midwayjs/socketio';
import { RedisService } from '@midwayjs/redis';
import { USER_SOCKET_MAP_KEY } from '../../socket/comm/const';
import { BaseSysParamService } from '../../base/service/sys/param';
import { WxService } from '../../wx/service/wx';
import { NoticeLogEntity } from '../entity/noticeLog.entity';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';

/**
 * 描述
 */
@Provide()
export class NoticeService extends BaseService {
  @InjectEntityModel(NoticeEntity)
  noticeEntity: Repository<NoticeEntity>;

  @App('socketIO')
  socketApp: SocketApplication;

  @Inject()
  redis: RedisService;

  @Inject()
  sysParamService: BaseSysParamService;

  @Inject()
  wxService: WxService;

  @InjectClient(CachingFactory, 'default')
  cache: MidwayCache;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.noticeEntity);
  }

  /**
   * 创建通知
   */
  async saveAndSend(data: any) {
    const res = await this.noticeEntity.save(data);
    // 给用户发送通知
    if (data.userId) {
      await this.sendMsgToClient(data.userId, res)
    }
    return res
  }


  /**
   * 向客户端发送socket消息
   * @param userId 
   * @param noticeId 
  */
  async sendMsgToClient(userId, notice) {
    const socketId = await this.redis.hget(USER_SOCKET_MAP_KEY, userId.toString());
    const messageStr = JSON.stringify({ ...notice });
    // 发送消息
    if (socketId) {
      this.socketApp.of('/client').to(socketId).emit('notice', messageStr);
    }
  }

  /**
   * 发送微信模版通知（新消息提醒）
   * 每当有新的用户找工匠时，给工匠发送消息提醒
   * 可配置发送频率
   */
  async sendWxTemplate_newMsg(receiveOpenId: string, msgData: { name: string, time: string, item: string }, conversationId: number) {
    const params = await this.sysParamService.dataByKey('wxTemplateParams_newMsg');
    const sendLimit = await this.sysParamService.dataByKey('wxTemplateLimit') || 60 * 5; // 默认5分钟
    const clientKey = `cache:wx:sendMsg:${receiveOpenId}-${conversationId}` // 一个用户的一次对话
    const { name, time, item } = msgData;
    const data = {
      thing2: { value: name },
      time4: { value: time },
      thing18: { value: item }
    }

    let hasLimit = await this.cache.get(clientKey);

    if (process.env.NODE_ENV === 'local') { // 本地开发环境不限制发送频率
      hasLimit = false;
    }

    if (hasLimit) { // 还在限制时间内，不发送
      return;
    }
    // const { template_id, url, miniprogram, appid, pagepath } = params;
    if (process.env.NODE_ENV === 'production') {
      await this.wxService.sendTemplateMessage(receiveOpenId, data, params, conversationId.toString());
      // 设置频率限制(秒)
      await this.cache.set(clientKey, 1, sendLimit * 1000);
      // 保存日志
      NoticeLogEntity.insert({
        content: JSON.stringify(msgData),
        type: 1,
        params: { receiveOpenId, data, params, conversationId }
      })
    }
  }
}

import { App, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { RedisService } from '@midwayjs/redis'
import { Application as SocketApplication } from '@midwayjs/socketio';
import { ConversationEntity } from '../entity/conversation.entity';
import { MessageEntity } from '../entity/message.entity';
import { UserConversationEntity } from '../entity/user_conversation.entity';
import { Not, Repository } from 'typeorm';
import { UserInfoEntity } from '../../user/entity/info';
import { USER_SOCKET_MAP_KEY } from '../comm/const';
import { SocketService } from '../../socket/service/socket';
import { NoticeService } from '../../notice/service/notice';
import { UserWxEntity } from '../../user/entity/wx';
import moment = require('moment');
import { InjectEntityModel } from '@midwayjs/typeorm';

/**
 * 描述
 */
@Provide()
export class ChatService extends BaseService {

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Inject()
  redis: RedisService;

  @App('socketIO')
  socketApp: SocketApplication;

  @Inject()
  socketService: SocketService

  @Inject()
  noticeService: NoticeService

  /**
   * 发送消息给某用户 socket
   * @param sendType 发送类型 1:用户发送 2:自动发送
   * @param fromUserId 发送消息的用户id
   */
  async sendMsgToUser(targetUserId: number, message: string, messageType: number, sendType: 1 | 2 = 1, fromUserId?: number) {
    const targetUser = await UserInfoEntity.findOneBy({ id: targetUserId });
    if (!targetUser) {
      throw new Error('用户不存在');
    }
    if(targetUser.status==2){
      throw new Error('用户已注销');
    }
    let isSend = 0;
    const userId = fromUserId || this.baseCtx.user?.id
    const isOnline = await this.isUserOnline(targetUserId);
    // 如果用户不在线则不发送socket
    if (isOnline) { // 在线
      isSend = 1;
      // 发送消息
      await this.sendMsgToClient(userId, message, messageType, targetUserId);
    }
    // 两个用户只允许有一个对话
    let conversation = await ConversationEntity.findOne(
      {
        where: [
          { creatorId: userId, receiverId: targetUserId },
          { creatorId: targetUserId, receiverId: userId }
        ]
      }
    );
    const now = new Date()
    // 如果之前没有对话记录 则新建一个
    if (!conversation) {
      const newConversation = new ConversationEntity();
      newConversation.creatorId = userId;
      newConversation.receiverId = targetUserId;
      newConversation.lastMessage = message;
      newConversation.lastMessageTime = now;
      newConversation.lastMessageType = messageType;
      await ConversationEntity.save(newConversation); // save后newConversation会是save后的对象
      conversation = newConversation;
      // 同时生成两个用户的ConversationUserEntity
      // 发送者会话
      const userConversation = new UserConversationEntity();
      userConversation.conversationId = newConversation.id;
      userConversation.userId = userId;
      userConversation.targetUserId = targetUserId;
      userConversation.hasUnread = 1;
      // userConversation.lastMessage = message;
      // userConversation.lastMessageTime = now;
      await UserConversationEntity.save(userConversation);
      // 接收者会话
      const userConversation2 = new UserConversationEntity();
      userConversation2.conversationId = newConversation.id;
      userConversation2.userId = targetUserId;
      userConversation2.targetUserId = userId;
      userConversation2.hasUnread = 1;
      userConversation2.unreadCount = 1;
      // userConversation2.lastMessage = message;
      // userConversation2.lastMessageTime = now;
      await UserConversationEntity.save(userConversation2);
      // TODO新建一个conversationId的room
    } else { // 如果双方有对话
      // 更新最后一条消息
      conversation.lastMessage = message;
      conversation.lastMessageTime = now;
      conversation.lastMessageType = messageType;
      await ConversationEntity.save(conversation);
      // 接收者未读加1
      const receiveUserConversation = await UserConversationEntity.findOne({
        where: {
          conversationId: conversation.id,
          userId: targetUserId
        }
      });
      receiveUserConversation.unreadCount++
      receiveUserConversation.save()
    }
    // 保存message
    const newMessage = new MessageEntity();
    newMessage.conversationId = conversation.id;
    newMessage.senderId = userId;
    newMessage.receiverId = targetUserId;
    newMessage.content = message;
    newMessage.type = messageType;
    newMessage.isSend = isSend;
    newMessage.sendType = sendType;
    await MessageEntity.save(newMessage);

    // 更新ConversationUserEntity,排除自己
    await UserConversationEntity.update({ conversationId: conversation.id, userId: Not(userId) }, { hasUnread: 1 });

    /******************** 发送微信模版消息通知 ********************/
    this.sendWxTmplateMsg({ targetUserId, userId, now, message, messageType, conversationId: conversation.id })

    return { conversationId: conversation.id }
  }

  /**
   * 用户对话列表
   * 显示creatorId的用户昵称、头像、最后一条消息、最后同一条时间、未读消息数
   */
  async userConversationList(userId: number, query: any) {
    const qb = UserConversationEntity.createQueryBuilder('cu')

  }

  /**
   * 向客户端发送socket消息
   * @param senderId 
   * @param message 
   * @param messageType 
   */
  async sendMsgToClient(senderId: number, message: string, messageType: number, receiverId: number) {
    this.socketService.sendDataToClient(receiverId, { message, messageType, senderId });
  }

  /**
   * 将message中isSend为0的消息发送给未接收的用户
   */
  async sendUnsendMsgToUser(receiverId: number) {
    const messages = await MessageEntity.find({ where: { receiverId, isSend: 0 } });
    messages.forEach(async message => {
      await this.sendMsgToClient(message.senderId, message.content, message.type, receiverId);
      message.isSend = 1;
      await MessageEntity.save(message);
    });
  }

  /**
   * 获取用户是否在线
   * 只要userId的socketId数组>0则认为在线
   */
  async isUserOnline(userId: number) {
    // const socketId = await this.redis.hget(USER_SOCKET_MAP_KEY, userId.toString());
    const socketIds = await this.redis.lrange(`${USER_SOCKET_MAP_KEY}:${userId}`, 0, -1);
    return socketIds && socketIds.length > 0;
  }

  /**
   * 发送微信模板消息
   */
  async sendWxTmplateMsg({ targetUserId, userId, now, message, messageType, conversationId }) {
    const targetWxUser = await UserWxEntity.findOneBy({ userId: targetUserId });
    if (targetWxUser) {
      const myInfo = await UserInfoEntity.findOneBy({ id: userId });
      const nowStr = moment(now).format('YYYY-MM-DD HH:mm:ss');
      let messageStr = message;
      let sendName = myInfo.nickName
      if (message.length > 20) {
        messageStr = message.substring(0, 18) + '..';
      }
      if (sendName.length > 20) {
        messageStr = messageStr.substring(0, 20)
      }
      if (messageType === 1) {
        messageStr = '[图片]'
      }
      if (targetWxUser.openid) {
        this.noticeService.sendWxTemplate_newMsg(targetWxUser.openid, { name: myInfo.nickName, time: nowStr, item: messageStr }, conversationId);
      }
    }
  }

  /**
   * 自动回复消息
   * @param userId 要发给的用户id
   * @param fromUserId 发送消息的用户id
   * 给userId的用户发送消息后，判断userId的用户是否有自动回复，如果有，则userId的发送自动回复消息给fromUserId
   */
  async autoReplyMsg(userId: number, fromUserId: number, messageType: number) {
    // const isOnline = await this.isUserOnline(userId);
    // 如果用户在线，则不发送自动回复
    // if (isOnline) return

    // 5-订单 6-发货通知 7-询问 消息不回复
    if (messageType == 5 || messageType == 6 || messageType == 7) return

    let { autoReplyInfo } = await this.userInfoEntity.findOne({ where: { id: userId }, select: ['autoReplyInfo'] }) || {}
    // 未开启自动回复
    if (!autoReplyInfo?.status) return

    const autoMessage = await MessageEntity.count({ where: [{ receiverId: userId, senderId: fromUserId, sendType: 2 }, { receiverId: fromUserId, senderId: userId, sendType: 2 }] })
    // 如果存在自动回复，则不发送自动回复
    if (autoMessage > 0) return

    await this.sendMsgToUser(fromUserId, autoReplyInfo.content, 0, 2, userId)
  }

}

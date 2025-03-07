import { WSController, OnWSConnection, Inject, OnWSMessage, App, OnWSDisConnection, } from "@midwayjs/decorator";
import { Context } from "@midwayjs/socketio";
import { Application as SocketApplication } from '@midwayjs/socketio';
import { SocketTokenMiddleware } from "../../middleware/token";
import { RedisService } from '@midwayjs/redis';
import { ChatService } from "../../../conversation/service/chat.service";
import { SOCKET_ACTION, USER_SOCKET_MAP_KEY } from "../../comm/const";
import { SocketLogEntity } from "../../entity/socketLog";
import { SocketService } from "../../service/socket";
import { Utils } from "../../../../comm/utils";
import { UserInfoEntity } from "../../../user/entity/info";

/**
 * socket客户端接入
 * TODO 现在{ middleware: [SocketTokenMiddleware] }不起作用不知道为什么 暂时配置的全局
 */
@WSController('/client', { middleware: [SocketTokenMiddleware] })
export class ClientController {

	@Inject()
	ctx: Context;

	@App('socketIO')
	app: SocketApplication;

	@Inject()
	redis: RedisService;

	@Inject()
	chatService: ChatService;

	@Inject()
	socketService: SocketService;

	@Inject()
	utils: Utils;

	// 客户端连接
	@OnWSConnection()
	async onConnection() {
		// @ts-ignore
		const userId = this.ctx.user?.id || ""

		const deviceId = this.ctx.handshake.query.deviceId as string;
		
		// 发送离线时收到的消息
		this.chatService.sendUnsendMsgToUser(userId);

		let userIdStore = userId 
		// redis 存 userId和socketId的对应关系
		const mapKey = USER_SOCKET_MAP_KEY;
		const userkey = `${mapKey}:${userIdStore}`;
		// 存用户id和socketId数组
		await this.redis.rpush(userkey, this.ctx.id);

		// const count = this.app.of('/client').sockets.size;     										 // 获取单个 namespace 里的连接数
		const realCount = await this.socketService.getKeysLength(USER_SOCKET_MAP_KEY)  // 实际独立用户数
		// console.log("参数", this.ctx.handshake.query);
		console.log("======================================");
		console.log("连入user:", userId);
		console.log("socketId:", this.ctx.id);
		console.log('当前socket数：', this.getSocketCount());
		console.log('实际用户数：', realCount);
		console.log("======================================");

		const now = new Date()
		// 记录用户连接log
		await SocketLogEntity.save({
			userId,
			deviceId,
			socketId: this.ctx.id,
			loginTime: now,
			action: SOCKET_ACTION.CONNECT,
			clientIp: this.ctx.handshake.address,
		});

		// 更新用户最后一次登录时间
		await UserInfoEntity.update({ id: userId }, { lastLoginTime: now });

		this.ctx.emit("data", "连接成功");
	}

	@OnWSDisConnection()
	async onDisconnectionMethod() {
		// @ts-ignore
		const userId = this.ctx.user?.id || ""
		const socketId = this.ctx.id;

		console.log("======================================");
		console.log("客户端断开连接:", userId, socketId);
		console.log('当前socket数：', this.getSocketCount());
		console.log('实际用户数：', await this.getRealUserCount());
		console.log("======================================");

		// const deviceId = this.ctx.handshake.query.deviceId as string;
		// let userIdStore = userId || deviceId || socketId // 没有登录的用户使用deviceId
		let userIdStore = userId
		// 删除 Redis socket数组中的socketId
		await this.redis.lrem(`${USER_SOCKET_MAP_KEY}:${userIdStore}`, 0, socketId);
		// 记录登出信息并计算登录时长
		const log = await SocketLogEntity.findOneBy({ socketId, action: SOCKET_ACTION.CONNECT });
		if (log) {
			const duration = Math.floor((new Date().getTime() - log.loginTime.getTime()) / 1000) // 计算时长（秒）
			await SocketLogEntity.insert({
				userId: log.userId,
				deviceId: log.deviceId,
				socketId: log.socketId,
				loginTime: log.loginTime,
				logoutTime: new Date(),
				duration,
				action: SOCKET_ACTION.DISCONNECT,
				clientIp: this.ctx.handshake.address,
			});
			// 给用户加上在线时长
			// 用户socketMap为空时才加，不然没有退出完
			const userSocketMap = await this.redis.lrange(`${USER_SOCKET_MAP_KEY}:${userIdStore}`, 0, -1);
			if (userSocketMap.length === 0) {
				await UserInfoEntity.update({ id: userId }, { onlineDuration: () => `onlineDuration + ${duration}` });
			}
		}
	}

	// 消息事件
	@OnWSMessage("myEvent")
	async gotMessage(data) {
		console.log("on data got", this.ctx.id, data);
	}

	/**
	 * 获取当前连接数
	 * @returns 
	 */
	getSocketCount() {
		return this.app.of('/client').sockets.size;
	}

	/**
	 * 获取实际用户数
	 * @returns 
	 */
	async getRealUserCount() {
		return await this.socketService.getKeysLength(USER_SOCKET_MAP_KEY);
	}
}
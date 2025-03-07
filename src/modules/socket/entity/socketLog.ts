import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * socket登入登出日志
 */
@Entity('app_socket_log')
export class SocketLogEntity extends BaseEntity {
  
  @Column({ comment: '用户ID' })
  userId: string;

  @Column({ comment: '设备ID', nullable: true })
  deviceId: string;

  @Column({ comment: 'socketID' })
  socketId: string;

  @Column({ comment: '登录时间', nullable: true })
  loginTime: Date;

  @Column({ comment: '登出时间', nullable: true })
  logoutTime: Date;

  @Column({ comment: '连接时长(秒)', nullable: true })
  duration: number; 

  @Column({ comment: '客户端IP', nullable: true })
  clientIp: string;

  @Column({ comment: '操作 connect disconnect', nullable: true })
  action: string
}

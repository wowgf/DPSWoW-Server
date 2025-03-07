import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { ArtisanInfoEntity } from './artisanInfo';

/**
 * 用户信息
 */
@Entity('user_info')
export class UserInfoEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '微信唯一ID', nullable: true, length: 50 })
  unionid: string;

  @Index({ unique: true })
  @Column({ comment: 'uid,前端展示', nullable: true, length: 20 })
  uid: string;

  @Column({ comment: '头像', nullable: true })
  avatarUrl: string;

  @Column({ comment: '昵称', nullable: true })
  nickName: string;

  @Index({ unique: true })
  @Column({ comment: '手机号', nullable: true })
  phone: string;

  @Column({ comment: '个人介绍', length: 300, nullable: true })
  introduction: string;

  @Column({ comment: '性别 0-未知 1-男 2-女', default: 0 })
  gender: number;

  @Column({ comment: '游戏其他信息', nullable: true, type: 'json' })
  gameInfo: any;

  @Column({ comment: '状态 0-禁用 1-正常 2-已注销', default: 1 })
  status: number;

  @Column({ comment: '注册渠道: PC WEB MOBIL', default: '', nullable: true, length: 30 })
  registerChannel: string

  @Column({ comment: '注册来源', default: '', nullable: true, length: 30 })
  registerRef: string;

  @Column({ comment: '密码', nullable: true })
  password: string;

  @Column({ comment: '最后一次登录时间', type: 'datetime', nullable: true })
  lastLoginTime: Date;

  @Column({ comment: '开关聊天功能 0-关闭 1-开启', nullable: true, default: 1 })
  isOpenChat: number

  @Column({ comment: '在线时长(秒)', default: 0 })
  onlineDuration: number;

  @Column({ comment: '最近一次活跃时间', type: 'datetime', nullable: true })
  lastActiveTime: Date;

  @Column({ comment: '自动回复信息', nullable: true, type: 'json' }) // {status:0,content:''}
  autoReplyInfo: any;

  @Index({ unique: true })
  @Column({ comment: '邀请码', nullable: true })
  inviteCode: string;

  @Column({ comment: '邀请人id', nullable: true })
  friendId: number;

}

import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 用户签到记录表 用户-邀请记录表
 */
@Entity('user_invite')
export class UserInviteEntity extends BaseEntity {
  @Column({ comment: '邀请人用户id' })
  userId: number;

  @Column({ comment: '受邀人用户id' })
  friendId: number;

  @Column({ comment: '邀请人奖励积分', default: 0 })
  points: number;

  @Column({ comment: '受邀人奖励积分', default: 0 })
  friendPoints: number;
}

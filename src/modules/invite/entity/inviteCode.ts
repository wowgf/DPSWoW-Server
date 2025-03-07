import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 描述
 */
@Entity('app_invite_code', { comment: '邀请码表' })
export class InviteCodeEntity extends BaseEntity {

  @Column({ type: 'varchar', length: 20, comment: '邀请码' })
  code: string;

  @Column({ type: 'boolean', comment: '是否已使用', default: false })
  isUsed: boolean;

  @Column({ type: 'timestamp', comment: '锁定时间', nullable: true })
  lockedAt: Date;

  @Column({ type: 'timestamp', comment: '使用时间', nullable: true })
  usedAt: Date;

  @Column({ type: 'int', comment: '使用人', nullable: true })
  userId: number;

  @Column({ type: 'int', comment: '邀请码类型 1-系统生成 2-用户生成', default: 1 })
  type: number;

  @Column({ type: 'varchar', comment: '客户端临时id', nullable: true, length: 50 })
  clientId: string;

}

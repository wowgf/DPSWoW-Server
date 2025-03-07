import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('app_wow_group_user', { comment: '微信群用户关联表' })
export class WowGroupUserEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255, comment: '微信群ID' })
  groupId: string;

  @Index()
  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  @CreateDateColumn({ type: 'timestamp', comment: '加入时间' })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updateTime: Date;
}
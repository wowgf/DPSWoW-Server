import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('app_wow_group', { comment: '微信群表' })
export class WowGroupEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255, comment: '微信群ID' })
  groupId: string;

  @Column({ type: 'varchar', length: 255, comment: '微信群名称', nullable: true })
  groupName: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updateTime: Date;
}
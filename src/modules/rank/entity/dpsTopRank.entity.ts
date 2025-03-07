import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('app_dps_top_rank')
export class DpsTopRankEntity extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  @Column({ type: 'varchar', length: 50, comment: '角色名称' })
  characterName: string;

  @Column({ type: 'varchar', length: 50, comment: '服务器名称' })
  serverName: string;

  @Index()
  @Column({ type: 'varchar', length: 30, comment: '职业名称' })
  className: string;

  @Index()
  @Column({ type: 'varchar', length: 30, comment: '专精名称' })
  spec: string;

  @Index()
  @Column({ type: 'int', comment: 'DPS数值' })
  dps: number;

  @Column({ type: 'int', comment: '装备等级', nullable: true })
  itemLevel: number;

  @Column({ type: 'uuid', comment: '关联的模拟记录ID' })
  simcRecordId: string;

  @Column({ type: 'tinyint', comment: '排行榜类型 1-单体 2-AOE' })
  rankType: number;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '最后更新时间' })
  updateTime: Date;
}
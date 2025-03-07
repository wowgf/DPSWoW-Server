import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SimulationOptions } from '../../../../typings/simc';

/**
 * 描述
 */
@Entity('app_user_simc_record', { comment: '用户运行记录表' })
export class UserSimcRecordEntity extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  // @Column({ type: 'text', comment: 'simc字符串' })
  // simcStr: string;

  @Column({ type: 'varchar', length: 255, comment: '插件原始字符串存储地址', nullable: true })
  originSimcStrUrl: string;

  @Column({ type: 'varchar', length: 255, comment: '最终simc字符串存储地址', nullable: true })
  rawSimcStrUrl: string;

  // @Column({ type: 'json', comment: 'simc结果', nullable: true })
  // result: object;

  @Column({ type: 'varchar', comment: '结果存储地址', nullable: true, length: 255 })
  rawResultUrl: string;

  @Column({ type: 'varchar', comment: 'html报告地址', nullable: true, length: 255 })
  htmlReportUrl: string;

  @Column({ type: 'int', comment: '花费积分' })
  cost: number;

  @Column({ type: 'json', comment: '最佳组合', nullable: true })
  bestCombo: Record<string, any>;

  // @Column({ type: 'json', comment: '所有组合', nullable: true })
  // combinations: any;

  @Column({ type: 'varchar', comment: '组合存储地址', nullable: true, length: 255 })
  combinationsUrl: string;

  @Column({ type: 'json', comment: '游戏角色信息', nullable: true })
  playerInfo: PlayerInfo;

  @Column({ type: 'json', comment: 'simc参数配置', nullable: true })
  simcConfig: SimulationOptions;

  @Column({ type: 'json', comment: '通用信息', nullable: true })
  params: any;

  @Column({ type: 'int', comment: '最佳DPS数', nullable: true })
  bestDps: number;

  @Column({ type: 'int', comment: '装等', nullable: true })
  itemLevel: number;

  @Column({ type: 'tinyint', comment: '类型 1-最佳装备 2-快速模拟 3-属性权重 4-低保 5-最佳掉落', default: 1 })
  type: number;

  @Column({ type: 'tinyint', comment: '状态 1-排队中 2-运行中 3-运行完成 9-失败', default: 1 })
  status: number;

  @Column({ type: 'varchar', comment: '任务ID', nullable: true, length: 50 })
  jobId: number | string;

  @Column({ type: 'tinyint', comment: '是否参加了排行 1-是 0-否', default: 0 })
  isRank: number;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updateTime: Date;

}

export interface PlayerInfo {
  race: string;          // 种族
  role: string;          // 角色定位
  spec: string;          // 专精
  level: string;         // 等级
  metier: string;        // 职业
  region: string;        // 区域
  server: string;        // 服务器
  talents: string;       // 天赋字符串
  warrior: string;       // 角色名称
  playerName: string;    // 玩家名称
  professions: string;   // 专业
}

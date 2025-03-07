import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 物品分类
 */
@Entity('app_wowdata_talent', { comment: '魔兽世界天赋表' })
export class WowTalentntity extends BaseEntity {

  @Index({ unique: true })
  @Column({ comment: '魔兽ID', nullable: false })
  talentId: number;

  @Column({ comment: '名称', nullable: false })
  name: string;

  @Column({ comment: '图片', nullable: true })
  image: string;

  @Column({ comment: 'buff', nullable: true })
  buff: string;

  @Column({ comment: 'buff', nullable: true })
  completion_category: number;

  @Column({ comment: '组成', nullable: true, type: 'json' })
  spells: any;

  @Column({ comment: '提示', nullable: true, })
  tooltip: string;

  @Column({ comment: '状态 0-不显示 1-显示', default: 1, type: 'tinyint' })
  status: number;
}

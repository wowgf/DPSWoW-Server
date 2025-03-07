import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 魔兽世界技能表
 */
@Entity('app_wowdata_spell', { comment: '魔兽世界技能表' })
export class WowSpellEntity extends BaseEntity {

  @Index({ unique: true })
  @Column({ comment: '魔兽ID', nullable: false })
  spellId: number;

  @Column({ comment: '名称', nullable: false })
  name: string;

  @Column({ comment: '图片', nullable: true })
  icon: string;

  @Column({ comment: '图片', nullable: true })
  icon_url: string;

  @Column({ comment: 'buff', nullable: true, type: 'text' })
  buff: string;

  @Column({ comment: '品质', nullable: true })
  quality: string;

  @Column({ comment: '组成', nullable: true, type: 'json' })
  spells: any;

  @Column({ comment: '组成', nullable: true, type: 'json' })
  buffspells: any;

  @Column({ comment: '魔兽ID', nullable: true })
  completion_category: number;

  @Column({ comment: '提示', nullable: true, type: 'text' })
  tooltip: string;

  @Column({ comment: '状态 0-不显示 1-显示', default: 1, type: 'tinyint' })
  status: number;
}

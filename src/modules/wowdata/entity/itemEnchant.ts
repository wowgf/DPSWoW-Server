import { Entity, Column, Index, } from 'typeorm';
import { BaseEntity } from '@cool-midway/core';

@Entity('app_wowdata_item_enchant', { comment: '魔兽世界物品强化表' })
export class WowdataItemEnchantEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '物品魔兽ID', nullable: false })
  itemId: number;

  @Column({ comment: '魔兽enchant_id', nullable: false })
  wowId: number;

  @Column({ comment: '效果ID', nullable: false })
  spellId: number;

  @Column({ comment: '名称', nullable: false })
  name: string;

  @Column({ comment: '展示名称', nullable: false })
  displayName: string;

  @Column({ comment: '资料片', nullable: false })
  expansion: string;

  @Column({ comment: '强化属性', nullable: true, type: 'json' })
  stats: any;

  @Column({ comment: '法术效果', nullable: true, type: 'json' })
  spellEffects: any;

  @Column({ comment: '装备要求', nullable: true, type: 'json' })
  equipRequirements: any;

  @Column({ comment: '部位', nullable: true })
  part: string;

  @Column({ comment: '插槽', nullable: true })
  slot: string;
  
  @Column({ comment: '插槽类型', nullable: true })
  socketType: string;

  @Column({ comment: '图标', nullable: false })
  icon: string;

  @Column({ comment: '图标地址', nullable: false })
  iconUrl: string;

  @Column({ comment: '法术图标', nullable: false })
  spellIcon: string;

  @Column({ comment: '法术图标地址', nullable: false })
  spellIconUrl: string;

  @Column({ comment: '品质 2 - 优秀 3 - 精良 4 - 史诗 5 - 传说', nullable: true, default: 3 })
  quality: number;

  @Column({ comment: '制作质量 1-1星 2-2星 3-3星', nullable: true, })
  craftingQuality: number;

  @Column({ comment: '强化描述', nullable: true })
  description: string;

  @Column({ comment: '提示', nullable: true, })
  tooltip: string;

  @Column({ comment: '状态 0-不显示 1-显示', default: 1, type: 'tinyint' })
  status: number;

}
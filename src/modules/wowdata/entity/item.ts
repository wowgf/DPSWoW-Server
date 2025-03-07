import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 物品分类
 */
@Entity('app_wowdata_item', { comment: '魔兽世界物品表' })
export class WowdataItemEntity extends BaseEntity {

  @Index({ unique: true })
  @Column({ comment: '物品魔兽ID', nullable: false })
  itemId: number;

  @Column({ comment: '物品名称', nullable: false })
  name: string;

  @Column({ comment: '物品图片', nullable: true })
  iconUrl: string;

  @Column({ comment: '物品等级', nullable: true })
  level: string;

  @Column({ comment: '品质', nullable: true })
  quality: string;

  @Column({ comment: '必要材料', nullable: true, type: 'json' })
  materials: any;

  @Column({ comment: '附加材料', nullable: true, type: 'json' })
  craftings: any;

  @Column({ comment: '物品属性', nullable: true, type: 'json' })
  attr: any;

  @Column({ comment: '组成', nullable: true, type: 'json' })
  spells: any;

  @Column({ comment: '提示', nullable: true })
  tooltip: string;

  @Column({ comment: '状态 0-不显示 1-显示', default: 1, type: 'tinyint' })
  status: number;

  @Column({ comment: '物品分类ID', nullable: true })
  catId: number;
}

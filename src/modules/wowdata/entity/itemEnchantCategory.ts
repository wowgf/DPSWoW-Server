import { Entity, Column, } from 'typeorm';
import { BaseEntity } from '@cool-midway/core';

/**
 * 附魔分类
 */

@Entity('app_wowdata_item_enchant_category', { comment: '魔兽世界物品强化分类表' })
export class WowdataItemEnchantCategoryEntity extends BaseEntity {
  @Column({ comment: '名称', nullable: false })
  name: string;

  @Column({ comment: '描述', nullable: true })
  description: string;

  @Column({ comment: '状态 0-不显示 1-显示', default: 1, type: 'tinyint' })
  status: number;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '部位', nullable: true })
  part: string;

  @Column({ comment: '类型 1-附魔 2-宝石', nullable: false, default: 1 })
  type: number;

}
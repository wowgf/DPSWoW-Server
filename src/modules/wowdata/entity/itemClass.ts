import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 物品分类
 */
@Entity('app_wowdata_item_class', { comment: '魔兽世界物品分类表' })
export class WowdataItemClassEntity extends BaseEntity {

  @Index({ unique: true })
  @Column({ comment: '物品魔兽分类ID', nullable: false })
  classId: number;

  @Column({ comment: '分类名称', nullable: false })
  name: string;

  @Column({ comment: '子分类', nullable: false, type: 'json' })
  subClass: any;

  @Column({ comment: '状态 0-不显示 1-显示', default: 1, type: 'tinyint' })
  status: number;

  @Column({ comment: '排序', default: 0 })
  sort: number;
}

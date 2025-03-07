import { BaseEntity } from '@cool-midway/core';
import { Entity, Column, } from 'typeorm';

@Entity('app_banner', { comment: "banner" })
export class BannerEntity extends BaseEntity {

  @Column({ comment: '位置 1-首页', nullable: false, default: 1 })
  position: number;

  @Column({ comment: '标题', nullable: true, })
  title: string;

  @Column({ comment: '封面', nullable: true, })
  cover: string;

  @Column({ comment: '链接', nullable: true, })
  link: string;

  @Column({ comment: '排序', nullable: false, default: 1 })
  sort: number;

  @Column({ comment: '状态 0-停用 1-启用', nullable: false, default: 1 })
  status: number;

}
import { BaseEntity } from '@cool-midway/core';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { UserInfoEntity } from './info';

@Entity('user_artisan_info')
export class ArtisanInfoEntity extends BaseEntity {

  @Column({ comment: '用户ID', nullable: false })
  userId: number;

  @Column({ comment: '游戏角色名', nullable: true })
  gameCharacterName: string;

  @Column({ comment: '所属服务器', nullable: true })
  serverName: string;

  @Column({ comment: '工匠技能', type: 'json', nullable: true })
  skills: string[];

  @Column({ comment: '工匠介绍', length: 250, nullable: true })
  introduction: string;

  @Column({ comment: '工匠展示图', type: 'json', nullable: true })
  images: string[];

  @Column({ comment: '在线时间 1-全天 2-白天 3-晚上', nullable: true })
  onlineTime: number;

  @Column({ comment: '发货速度 1-秒发 2-10min 3-1h 4-8h', nullable: true })
  deliverySpeed: number;

  @Column({ comment: '发货时间段', nullable: true, type: 'json' })
  deliveryTimes: any;

  @Column({ comment: '平台认证等级', nullable: true })
  platformLevel: string;

  @Column({ comment: '工匠状态 0-未认证 1-已认证', default: 1 })
  status: number;

  @Column({ comment: '是否同意上传工匠数据至第三方魔兽插件 1-同意 0-不同意', default: 1 })
  allowSyncData: number;

  @Column({ comment: 'nga公益帖链接', nullable: true })
  ngaGyUrl: string;

  @Column({ comment: '是否nga认证 1-是 0-否', nullable: true, default: 0 })
  isNgaCertified: number;

  @OneToOne(() => UserInfoEntity)
  @JoinColumn({ name: 'userId' })
  user: UserInfoEntity;

  // @OneToMany(() => ArtisanAbilityEntity, ability => ability.artisanInfo)
  // abilities: ArtisanAbilityEntity[];
}
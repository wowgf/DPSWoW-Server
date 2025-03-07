import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 大脚用户信息
 */
@Entity('bigfoot_user_info')
export class BigfootUserInfoEntity extends BaseEntity {

  @Column({ comment: '所属用户ID' })
  userId: number;

  @Index({ unique: true })
  @Column({ comment: '唯一ID', nullable: false })
  uuid: string;

  @Column({ comment: '头像', nullable: true })
  avatarUrl: string;

  @Column({ comment: '昵称', nullable: true })
  name: string;

  @Column({ comment: '性别 0-未知 1-男 2-女', default: 0 })
  sex: number;

  @Column({ comment: '年龄', default: 0 })
  age: number;

  @Column({ comment: '注册时间', type: 'datetime', nullable: true })
  registerTime: Date;

  @Column({ comment: '其他数据信息', nullable: true, type: 'json' })
  details: any;

  @Column({ comment: '状态 0-禁用 1-正常 2-已注销', default: 1 })
  status: number;
}

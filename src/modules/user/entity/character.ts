import { BaseEntity } from '@cool-midway/core';
import { Entity, Column, Index } from 'typeorm';

/**
 * 用户角色表
 */
@Entity('user_character')
export class UserCharacterEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '角色名' })
  characterName: string;

  @Column({ comment: '职业' })
  className: string;

  @Column({ comment: '专精' })
  specName: string;

  @Column({ comment: '服务器' })
  serverName: string;

  @Column({ comment: '插件复制出的字符串', type: 'text' })
  simcStr: string;
}

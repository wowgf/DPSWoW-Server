import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 描述
 */
@Entity('app_user_points', { comment: '用户积分表' })
export class UserPointsEntity extends BaseEntity {
  
  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  @Column({ type: 'int', comment: '积分' })
  points: number;

  @Column({ type: 'int', comment: '积分类型 1-模拟积分', default: 1 })
  type: number;

}

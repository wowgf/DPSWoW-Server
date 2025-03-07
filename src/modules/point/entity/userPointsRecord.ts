import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 描述
 */
@Entity('app_user_points_record', { comment: '用户积分记录表' })
export class UserPointsRecordEntity extends BaseEntity {
  
  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  @Column({ type: 'int', comment: '积分变化' })
  pointsChange: number;

  @Column({ type: 'int', comment: '积分余额' })
  pointsBalance: number;

  @Column({ type: 'varchar', length: 255, comment: '备注' })
  remark: string;
}

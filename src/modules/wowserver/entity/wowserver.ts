import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 描述
 */
@Entity('app_wow_server_data')
export class WowServerDataEntity extends BaseEntity {

  @Column({ comment: '服务器名称', nullable: false })
  serverName: string;

  @Column({ comment: '服务器IP地址', nullable: true })
  ipAddress: string;

  @Column({ comment: '服务器状态 0-关闭 1-开启', nullable: true, default: 1, type: 'tinyint' })
  status: number;

  @Column({ comment: '服务器地区', nullable: true, default: 'CN' })
  region: string;

  @Column({ comment: '服务器类型', nullable: true, default: '普通' })
  type: string;

  @Column({ comment: '备注', nullable: true })
  remark: string;

  @Column({ comment: '排序', nullable: false, default: 0 })
  sort: number;

  @Column({ comment: '父节点ID', nullable: true })
  parentId: number;

  @Column({ comment: '节点类型 1-服务器 2-服务器组 3-分区', default: 1, type: 'tinyint' })
  nodeType: number;

}

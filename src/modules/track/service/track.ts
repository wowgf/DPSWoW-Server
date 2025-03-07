import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { TrackEntity } from '../entity/track';
import { Utils } from '../../../comm/utils';
import { Context } from '@midwayjs/koa';

/**
 * 描述
 */
@Provide()
export class TrackService extends BaseService {
  @InjectEntityModel(TrackEntity)
  trackEntity: Repository<TrackEntity>;

  @Inject()
  utils: Utils;

  @Inject()
  ctx: Context;

  /**
   * 记录行为
   */
  async recordTrack(userId: string, event: string, params: any) {
    const ip: any = await this.utils.getReqIP(this.ctx);
    await this.trackEntity.save({ userId, event, params, ip });
  }
}

import { Provide } from '@midwayjs/decorator';
import { BaseService, CoolCache } from '@cool-midway/core';
import { TrackEntity } from '../../track/entity/track';

/**
 * 描述
 */
@Provide()
export class TrackDataService extends BaseService {

  /**
   * 行为排行榜
   * 根据event进行排行
   */
  @CoolCache(1000 * 60)
  async getRank(query: { startDate?: string, endDate?: string }) {
    const { startDate, endDate } = query;
    let track = TrackEntity.createQueryBuilder('track')
      .select('count(track.id) as count')
      .addSelect('track.event as event')
      .groupBy('track.event')
      .orderBy('count', 'ASC')

    if (startDate) {
      track = track.andWhere('track.createTime >= :startDate', { startDate });
    }

    if (endDate) {
      track = track.andWhere('track.createTime <= :endDate', { endDate });
    }

    return await track.getRawMany();
  }

  /**
   * 行为分析
   * 根据event=CLICK_HOME_HOT_CARD 进行分析
   * 根据params.title进行分组排名
   */
  @CoolCache(1000 * 60)
  async analyzeClickHomeHotCard(query: { startDate?: string, endDate?: string }) {
    // 获取所有 CLICK_HOME_HOT_CARD 事件的数据
    const { startDate, endDate } = query;
    let track = TrackEntity.createQueryBuilder('track')
      .select('count(track.id) as count')
      .addSelect('track.params->"$.title" as title')
      .where('track.event = :event', { event: 'CLICK_HOME_HOT_CARD' })
      .groupBy('track.params->"$.title"')
      .orderBy('count', 'ASC')

    if (startDate) {
      track = track.andWhere('track.createTime >= :startDate', { startDate });
    }

    if (endDate) {
      track = track.andWhere('track.createTime <= :endDate', { endDate });
    }
    return await track.getRawMany();
  }

}

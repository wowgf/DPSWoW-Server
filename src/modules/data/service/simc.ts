import { InjectClient, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCache } from '@cool-midway/core';
import moment = require('moment');
import { BaseSysLogEntity } from '../../base/entity/sys/log';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { UserSimcRecordEntity } from '../../simc/entity/userSimcRecord';

/**
 * 描述
 */
@Provide()
export class SimcDataService extends BaseService {

  /**
   * 统计一段时间内的模拟战斗次数
   * 不传时间默认统计全部
   */
  async getSimcCount(params: { startDate?: string, endDate?: string }) {
    const simc = UserSimcRecordEntity.createQueryBuilder('simc')
    simc.select("id")
    if (params.startDate) {
      simc.where('createTime >= :startDate', { startDate: params.startDate })
    }
    if (params.endDate) {
      simc.andWhere('createTime <= :endDate', { endDate: params.endDate })
    }

    return await simc.getCount()

  }

  /**
   * 统计一段时间内的模拟人数
   * 不传时间默认统计全部
   */
  async getSimcUserCount(params: { startDate?: string, endDate?: string }) {
    const simc = UserSimcRecordEntity.createQueryBuilder('simc')
      .select('COUNT(DISTINCT simc.userId)', 'count')

    if (params.startDate) {
      simc.where('createTime >= :startDate', { startDate: params.startDate });
    }
    if (params.endDate) {
      simc.andWhere('createTime <= :endDate', { endDate: params.endDate });
    }

    return await simc.getRawOne().then(res => res.count).catch(() => 0);
  }

  /**
   * 统计一段时间内的人均模数
   * 不传时间默认统计全部
   */
  async getSimcAvgCount(params: { startDate: string, endDate: string }) {
    const totalSimcCount = await this.getSimcCount(params);
    const totalUserCount = await this.getSimcUserCount(params);

    if (totalUserCount === 0) {
      return 0;
    }

    return totalSimcCount / totalUserCount;
  }

}

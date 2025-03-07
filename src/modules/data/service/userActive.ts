import { Init, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { BaseSysLogEntity } from '../../base/entity/sys/log';
import moment = require('moment');
import { CoolCache } from "@cool-midway/core";
import { UserInfoEntity } from '../../user/entity/info';

/**
 * 用户统计
 */
@Provide()
export class UserActiveDataService extends BaseService {

  async getActiveUserCountByDate(startDate: string, endDate: string) {
    // 判断用户活跃的接口
    // const action = '/app/user/info/person';
    // const raw = BaseSysLogEntity.createQueryBuilder('log')
    //   .select('COUNT(DISTINCT log.userId)', 'count')
    //   .where('log.createTime >= :startDate', { startDate })
    //   .andWhere('log.createTime <= :endDate', { endDate })
    //   .andWhere('log.action = :action', { action })
    // return raw.getRawOne().then(res => res.count).catch(() => 0);
    const raw = UserInfoEntity.createQueryBuilder('user')
      .select('COUNT(DISTINCT user.id)', 'count')
      .where('user.lastActiveTime >= :startDate', { startDate })
      .andWhere('user.lastActiveTime <= :endDate', { endDate })
    return await raw.getRawOne().then(res => res.count).catch(() => 0);
  }

  /**
   * 日活
   */
  async getDailyActiveUsers() {
    const today = moment().format('YYYY-MM-DD 00:00:00');
    const todayEnd = moment().format('YYYY-MM-DD 23:59:59');
    return await this.getActiveUserCountByDate(today, todayEnd);
  }

  /**
   * 昨日
   */
  async getYesterdayActiveUsers() {
    const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD 00:00:00');
    const yesterdayEnd = moment().subtract(1, 'days').format('YYYY-MM-DD 23:59:59');
    return await this.getActiveUserCountByDate(yesterday, yesterdayEnd);
  }

  /**
   * 周活
   */
  async getWeeklyActiveUsers() {
    // 本周周一到周日
    const startDate = moment().startOf('week').format('YYYY-MM-DD 00:00:00');
    const endDate = moment().endOf('week').format('YYYY-MM-DD 23:59:59');
    return await this.getActiveUserCountByDate(startDate, endDate);
  }

  /**
   * 上周
   */
  async getLastWeekActiveUsers() {
    // 上周周一到周日
    const startDate = moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD 00:00:00');
    const endDate = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD 23:59:59');
    return await this.getActiveUserCountByDate(startDate, endDate);
  }

  /**
   * 月活
   */
  async getMonthlyActiveUsers() {
    const startDate = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
    const endDate = moment().endOf('month').format('YYYY-MM-DD 23:59:59');
    return await this.getActiveUserCountByDate(startDate, endDate);
  }

  /**
   * 上月
   */
  async getLastMonthActiveUsers() {
    const startDate = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD 00:00:00');
    const endDate = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD 23:59:59');
    return await this.getActiveUserCountByDate(startDate, endDate);
  }

  /**
   * 用户活跃数据（综合）
   */
  // 数据缓存30秒
  @CoolCache(30 * 1000)
  async getActiveUserData() {
    return {
      today: await this.getDailyActiveUsers(),
      yesterday: await this.getYesterdayActiveUsers(),
      week: await this.getWeeklyActiveUsers(),
      lastWeek: await this.getLastWeekActiveUsers(),
      month: await this.getMonthlyActiveUsers(),
      lastMonth: await this.getLastMonthActiveUsers(),
    };
  }
}

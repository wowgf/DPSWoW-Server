import { InjectClient, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCache } from '@cool-midway/core';
import moment = require('moment');
import { BaseSysLogEntity } from '../../base/entity/sys/log';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';

/**
 * 描述
 */
@Provide()
export class VisitDataService extends BaseService {

  // 统计的action
  private actionList = [
    '/app/category/category/list',
    '/app/user/info/person',
    '/app/category/sectionCategory/list',
    '/app/base/comm/param'
  ];

  // 缓存key
  private VISIT_COUNT_KEY = 'VISIT_COUNT_';

  @InjectClient(CachingFactory, 'default')
  cache: MidwayCache;

  /**
   * 查询一段时间内action为 /login /user 的IP每日的数量
   * @param startDate 开始日期 
   * @param endDate 结束日期
    */
  async getVisitByIp(startDate: string, endDate: string) {
    const log = BaseSysLogEntity.createQueryBuilder('log')
    log.select('DATE_FORMAT(log.createTime, "%Y-%m-%d") as date')
    log.addSelect("COUNT(DISTINCT log.ip) as ipCount")
    log.where('createTime >= :startDate', { startDate })
      .andWhere('createTime <= :endDate', { endDate })
      .andWhere('log.action in (:...action)', { action: this.actionList })
    log.groupBy("date")
    return log.getRawMany()
  }

  /**
   * 查询一段时间内action为 /login /user 的userId每日的数量
   * @param startDate 开始日期 
   * @param endDate 结束日期
    */
  async getVisitByUserId(startDate: string, endDate: string) {
    const log = BaseSysLogEntity.createQueryBuilder('log')
    log.select('DATE_FORMAT(log.createTime, "%Y-%m-%d") as date')
    log.addSelect("COUNT(DISTINCT log.userId) as userIdCount")
      .where('createTime >= :startDate', { startDate })
      .andWhere('createTime <= :endDate', { endDate })
      .andWhere('log.userId is not null')
      .andWhere('log.action in (:...action)', { action: this.actionList })
    log.groupBy("date")

    return log.getRawMany()
  }

  /**
   * 获取今日访问量 - 缓存10分钟
   */
  @CoolCache(1000 * 60 * 5)
  async getTodayVisitCount() {
    let startDate = moment().format('YYYY-MM-DD') + ' 00:00:00'
    let endDate = moment().format('YYYY-MM-DD') + ' 23:59:59'
    let ipCountList = await this.getVisitByIp(startDate, endDate)
    let userIdCountList = await this.getVisitByUserId(startDate, endDate)

    return {
      ipCount: Number(ipCountList[0]?.ipCount) || 0,
      userCount: Number(userIdCountList[0]?.userIdCount) || 0
    }
  }

  /**
   * 获取昨日访问量
   */
  async getYestdayVisitCount() {
    let date = moment().subtract(1, 'days').format('YYYY-MM-DD')
    // 查询缓存是否有昨日数据
    let data = await this.getDateCountData(date)
    // 有就直接返回
    if (data) {
      return data
    }

    let startDate = date + ' 00:00:00'
    let endDate = date + ' 23:59:59'
    let ipCountList = await this.getVisitByIp(startDate, endDate)
    let userIdCountList = await this.getVisitByUserId(startDate, endDate)

    data = {
      ipCount: Number(ipCountList[0]?.ipCount) || 0,
      userCount: Number(userIdCountList[0]?.userIdCount) || 0
    }

    this.setDateCountData(date, data)
    return data
  }

  async setDateCountData(date, data) {
    this.cache.set(this.VISIT_COUNT_KEY + date, data)
  }

  async getDateCountData(date) {
    return await this.cache.get(this.VISIT_COUNT_KEY + date)
  }
}

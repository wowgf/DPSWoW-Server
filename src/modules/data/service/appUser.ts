import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Repository } from 'typeorm';
import { UserInfoEntity } from '../../user/entity/info';
import * as moment from 'moment';

/**
 * 描述
 */
@Provide()
export class AppUserDataService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  async getData() {
    let total = await this.getCount();
    let yesterday = await this.getYesterdayCount();
    let today = await this.getTodayCount();
    let week = await this.getWeekCount();
    let month = await this.getMonthCount();
    let lastWeek = await this.getLastWeekCount();
    return {
      total,
      yesterday,
      today,
      week,
      month,
      lastWeek,
    }
  }

  /**
   * 描述
   */
  async getCount() {
    let res = await this.userInfoEntity.count();
    return res;
  }

  /**
   * 获取一段时间段注册量
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 
   */
  async getUserCountByDate(startDate: any, endDate: any) {
    let res = await this.userInfoEntity.count({
      where: {
        createTime: Between(startDate, endDate),
      },
    });
    return res;
  }

  /**
   * 获取昨日注册量
   */
  async getYesterdayCount() {
    let yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    let count = await this.getUserCountByDate(
      yesterdayDate + ' 00:00:00',
      yesterdayDate + ' 23:59:59'
    );
    return count;
  }

  /**
   * 获取今日注册量
   */
  async getTodayCount() {
    let todayDate = moment().format('YYYY-MM-DD');
    let count = await this.getUserCountByDate(
      todayDate + ' 00:00:00',
      todayDate + ' 23:59:59'
    );
    return count;
  }

  /**
   * 获取本周注册量 周一 - 周日
   */
  async getWeekCount() {
    // 获取今天的日期
    const today = moment();
    const weekStartDate = today.clone().startOf('isoWeek').format('YYYY-MM-DD'); // ISO模式，周一为一周的开始
    const weekEndDate = today.clone().endOf('isoWeek').format('YYYY-MM-DD'); // ISO模式，周日为一周的结束

    let count = await this.getUserCountByDate(
      weekStartDate + ' 00:00:00',
      weekEndDate + ' 23:59:59'
    );
    return count;
  }

  /**
   * 获取本月注册量
   */
  async getMonthCount() {
    let monthStartDate = moment().startOf('month').format('YYYY-MM-DD')
    let monthEndDate = moment().endOf('month').format('YYYY-MM-DD')

    let count = await this.getUserCountByDate(
      monthStartDate + ' 00:00:00',
      monthEndDate + ' 23:59:59'
    );
    return count;
  }

  /**
   * 获取上周注册量 周一 - 周日
   */
  async getLastWeekCount() {
    let lastWeekStartDate = moment().startOf('week').subtract(1, 'week').add(1, 'day').format('YYYY-MM-DD')
    let lastWeekEndDate = moment().endOf('week').subtract(1, 'week').add(1, 'day').format('YYYY-MM-DD')

    let count = await this.getUserCountByDate(
      lastWeekStartDate + ' 00:00:00',
      lastWeekEndDate + ' 23:59:59'
    )
    return count;
  }
}

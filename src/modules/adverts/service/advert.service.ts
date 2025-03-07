import { Provide, Config, Inject } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Between, Equal } from 'typeorm';
import { UserAdvertRecord } from '../entity/userAdvertRecord';
import { UserPointsService } from '../../point/service/userPoint.service';

@Provide()
export class AdvertService extends BaseService {
  @InjectEntityModel(UserAdvertRecord)
  userAdvertRecord: Repository<UserAdvertRecord>;

  @Inject()
  userPointsService: UserPointsService;

  @Config('module.adverts.config')
  config: any;

  /**
   * 开始观看
   */
  async startView(userId: number, advertId: string, adType = 1) {
    const record = await this.userAdvertRecord.findOneBy({ userId, advertId });
    if (record) {
      throw new Error('广告ID重复');
    }
    return await this.userAdvertRecord.insert({
      userId,
      advertId,
      adType,
      startTime: new Date()
    });
  }

  /**
   * 结束广告观看并发放积分
   */
  async endAdView(userId: number, advertId: string) {
    // 校验时间是否>25秒
    const record = await this.userAdvertRecord.findOne({
      where: { userId, advertId: Equal(advertId), status: 1 },
    });
    if (!record) {
      throw new Error('观看无效，未获取积分');
    }
    const timeDiff = new Date().getTime() - record.startTime.getTime();
    if (timeDiff < 6000) {
      throw new Error('观看时间无效，未获取积分');
    }

    // 检查用户今日是否已达观看上限
    const viewCount = await this.getTodayViewCount(userId);

    if (viewCount >= this.config.dailyViewLimit) {
      throw new Error('今日观看次数已达上限');
    }

    // 更新观看记录并发放积分
    const points = this.config.pointsPerView || 1000;
    await this.userAdvertRecord.update(
      { userId, advertId },
      { endTime: new Date(), rewardValue: points, status: 2 }
    );

    // 增加用户积分
    await this.userPointsService.addPoints(userId, points, '观看广告奖励');

    return {
      rewordPoints: points
    };
  }

  /**
   * 获取用户今日观看次数
   */
  async getTodayViewCount(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await this.userAdvertRecord.count({
      where: {
        userId,
        startTime: Between(today, tomorrow),
        status: 2
      }
    });

    return count;
  }

  /**
   * 获取观看上限和已观看次数
   */
  async getViewLimitAndCount(userId: number) {
    const viewCount = await this.getTodayViewCount(userId);
    return {
      viewCount,
      viewLimit: this.config.dailyViewLimit
    };
  }

  /**
   * 获取广告观看状态
   */
  async getAdvertStatus(userId: number, advertId: string) {
    const record = await this.userAdvertRecord.findOneBy({ userId, advertId: Equal(advertId) });
    if (!record) {
      throw new Error('无广告');
    }
    const status = record ? record.status : 1;
    return {
      status
    };
  }
}

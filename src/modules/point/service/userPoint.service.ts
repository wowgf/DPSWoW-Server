import { Provide, Inject } from '@midwayjs/decorator';
import { Equal, Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { UserPointsEntity } from '../entity/userPoints';
import { UserPointsRecordEntity } from '../entity/userPointsRecord';

@Provide()
export class UserPointsService extends BaseService {

  @InjectEntityModel(UserPointsEntity)
  userPointsEntity: Repository<UserPointsEntity>;

  @InjectEntityModel(UserPointsRecordEntity)
  userPointsRecordEntity: Repository<UserPointsRecordEntity>;

  /**
   * 获取用户积分
   * @param userId
   */
  async getPoints(userId: number): Promise<number> {
    const userPoints = await this.userPointsEntity.findOne({ where: { userId: Equal(userId) } });
    return userPoints ? userPoints.points : 0;
  }

  /**
   * 消耗用户积分
   * @param userId
   * @param points
   */
  async consumePoints(userId: number, points: number): Promise<void> {
    let userPoints = await this.userPointsEntity.findOne({ where: { userId } });
    if (!userPoints) {
      userPoints = new UserPointsEntity();
      userPoints.userId = userId;
      userPoints.points = 0;
      await this.userPointsEntity.save(userPoints);
    }
    // if (userPoints.points < points) {
    //   throw new CoolCommException('积分不足');
    // }
    userPoints.points -= points;
    await this.userPointsEntity.save(userPoints);
    // 记录消耗积分
    await this.userPointsRecordEntity.insert({
      userId, pointsChange: -points, pointsBalance: userPoints.points, remark: '消耗积分-模拟DPS'
    });
  }

  /**
   * 增加用户积分
   * @param userId
   * @param points
   */
  async addPoints(userId: number, points: number, remark?: string): Promise<void> {
    let userPoints = await this.userPointsEntity.findOne({ where: { userId } });
    if (!userPoints) {
      userPoints = new UserPointsEntity();
      userPoints.userId = userId;
      userPoints.points = points;
    } else {
      userPoints.points += points;
    }
    await this.userPointsEntity.save(userPoints);
    // 记录增加积分
    await this.userPointsRecordEntity.insert({
      userId, pointsChange: points, pointsBalance: userPoints.points, remark,
    });
  }

  /**
   * 校验用户积分
   */
  async checkPoints(userId: number, points: number) {
    const userPoints = await this.getPoints(userId);
    // return userPoints >= points;
    if (userPoints < points) {
      throw new CoolCommException('积分不足');
    }
  }
}
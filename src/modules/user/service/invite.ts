import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { UserInfoEntity } from '../entity/info';
import { BaseSysParamService } from '../../base/service/sys/param';
import { UserPointsService } from '../../point/service/userPoint.service';
import { UserInviteEntity } from '../entity/invite';

/**
 * 描述
 */
@Provide()
export class InviteService extends BaseService {

  @Inject()
  baseSysParamService: BaseSysParamService

  @Inject()
  userPointsService: UserPointsService

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(UserInviteEntity)
  userInviteEntity: Repository<UserInviteEntity>;

  async getUserInviteCode(userId: any) {
    let data = await this.userInfoEntity.findOne({ where: { id: userId } });
    if (data.inviteCode) {
      return data.inviteCode;
    } else {
      let inviteCode = this.generateInviteCode();
      await this.userInfoEntity.update(
        { id: userId },
        { inviteCode: inviteCode }
      );
      return inviteCode;
    }
  }

  /**
   * 生成6位邀请码，无规律、唯一、不重复
   * @param userId 用户id
   */
  generateInviteCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let inviteCode;
    do {
      inviteCode = '';
      for (let i = 0; i < 6; i++) {
        inviteCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (!/[A-Z]/.test(inviteCode) || !/[0-9]/.test(inviteCode));
    return inviteCode;
  }

  /**
   * 奖励
   */
  async validateInviteCode(code: string) {
    const config = await this.baseSysParamService.dataByKey('invite');
    const maxInviteNum = config?.maxInviteNum || -1 // 小于0时不限制邀请数量
    let data = await this.userInfoEntity.findOne({ where: { inviteCode: Equal(code) }, select: ['id'] })
    if (!data) {
      throw new CoolCommException('好友邀请码无效');
    }
    // 邀请次数校验
    if (maxInviteNum > 0) {
      const count = await this.userInviteEntity.count({ where: { userId: data.id } })
      if (count >= maxInviteNum) {
        throw new CoolCommException('好友邀请码无效');
      }
    }
    return data
  }

  /**
   * 邀请奖励
   * @param userId 受邀人Id
   * @param friendId 邀请人Id
   */
  async inviteReward(userId, friendId) {
    const config = await this.baseSysParamService.dataByKey('invite');
    const rewardInviterValue = config?.rewardInviterValue || 0
    const rewardUserValue = config?.rewardUserValue || 0

    this.userInviteEntity.save({
      userId: friendId, // 邀请人用户id
      friendId: userId, // 受邀人用户id
      points: rewardInviterValue, // 邀请人奖励
      friendPoints: rewardUserValue, // 受邀人奖励
    })

    if (rewardUserValue > 0) await this.userPointsService.addPoints(userId, rewardUserValue, '新用户注册赠送')
    if (rewardInviterValue > 0) await this.userPointsService.addPoints(friendId, rewardInviterValue, '邀请好友奖励')
  }
}

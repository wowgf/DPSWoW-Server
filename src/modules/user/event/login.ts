import { Inject, Provide, Scope, ScopeEnum } from "@midwayjs/decorator";
import { CoolEvent, Event } from "@cool-midway/core";
import { UserInfoEntity } from "../entity/info";
import { InviteCodeService } from '../../invite/service/inviteCode';
import { BaseSysParamService } from "../../base/service/sys/param";
import { UserPointsService } from "../../point/service/userPoint.service";

/**
 * 接收事件
 */
@CoolEvent()
export class DemoEvent {

  @Inject()
  inviteCodeService: InviteCodeService;

  @Inject()
  userPointsService: UserPointsService;

	@Inject()
	sysParamService: BaseSysParamService;

  /**
   * 新用户注册成功事件
   * @param user
   */
  @Event("newUserRegister")
  async newUserRegister(user: UserInfoEntity, inviteCode: string) {
		// 获取新用户赠送积分参数
		const config = await this.sysParamService.dataByKey('jsonConfig');
		const awardPoints = config?.newUserAwardPoints || 1000;
    // 使用邀请码
    await this.inviteCodeService.useInviteCode(inviteCode, user.id);
    // 新用户奖励，初始化用户积分记录，并赠送1000积分
    await this.userPointsService.addPoints(user.id, awardPoints, '新用户注册赠送');
  }
}
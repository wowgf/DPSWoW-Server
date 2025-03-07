import { Provide, Inject } from '@midwayjs/decorator';
import { Equal, Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { InviteCodeEntity } from '../entity/inviteCode';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { BaseSysParamService } from '../../base/service/sys/param';

@Provide()
export class InviteCodeService extends BaseService {

  @InjectEntityModel(InviteCodeEntity)
  inviteCodeEntity: Repository<InviteCodeEntity>;

  @Inject()
  sysParamService: BaseSysParamService;

  /**
   * 验证邀请码
   * @param code
   * @param clientId
   * @param islock 是否锁定邀请码 主要是防止任意调此接口都更新lockedAt 没啥用
   */
  async validateInviteCode(code: string, clientId: string, islock = false): Promise<void> {
    // 从param拿白名单
    const whiteList: string[] = await this.sysParamService.dataByKey('inviteCodeWhiteList') || [];
    // 支持白名单邀请码
    if (whiteList.includes(code)) {
      return;
    }
    
    if (!clientId) {
      throw new CoolCommException('客户端id不能为空');
    }
    const inviteCode = await this.inviteCodeEntity.findOne({ where: { code: Equal(code) } });
    if (!inviteCode) {
      throw new CoolCommException('邀请码无效');
    }
    if (inviteCode.isUsed) {
      throw new CoolCommException('邀请码已被使用');
    }
    // 锁定时间2min
    const lockTime = 2 * 60 * 1000;
    if (inviteCode.lockedAt && new Date().getTime() - new Date(inviteCode.lockedAt).getTime() < lockTime && inviteCode.clientId !== clientId) {
      throw new CoolCommException('邀请码已被使用，请尝试其他邀请码');
    }
    if (islock) {
      inviteCode.lockedAt = new Date();
    }
    inviteCode.clientId = clientId;
    await this.inviteCodeEntity.save(inviteCode);
  }

  /**
   * 使用邀请码
   * @param code
   */
  async useInviteCode(code: string, userId: number): Promise<void> {
    // 白名单
    const whiteList: string[] = await this.sysParamService.dataByKey('inviteCodeWhiteList') || [];
    if (whiteList.includes(code)) {
      return;
    }
    const inviteCode = await this.inviteCodeEntity.findOne({ where: { code: Equal(code) } });
    if (!inviteCode) {
      throw new CoolCommException('邀请码无效');
    }
    inviteCode.isUsed = true;
    inviteCode.userId = userId;
    inviteCode.usedAt = new Date();
    await this.inviteCodeEntity.save(inviteCode);
  }

  /**
   * 批量生成邀请码
   * 随机生成6位大写字母+数字
   * @param count 生成数量
   * @param type 邀请码类型 1-系统生成 2-用户生成
   */
  async generateInviteCode(count = 1, type = 1) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substr(2, 6).toUpperCase();
      codes.push({ code, type });
    }
    return await this.inviteCodeEntity.save(codes);
  }

}
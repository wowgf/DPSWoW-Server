import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { WxService } from '../../../wx/service/wx';
import { GroupService } from '../../service/group.service';

/**
 * 描述
 */
@CoolController()
export class AppGroupController extends BaseController {

  @Inject()
  wxService: WxService;

  @Inject()
  groupService: GroupService;

  /**
   * 绑定用户和群
   */
  @Post('/bind')
  async bindUserToGroup(
    @Body('code') code: string,
    @Body('encryptedData') encryptedData: string,
    @Body('iv') iv: string,
  ) {
    const shareInfo = await this.wxService.getMiniShareInfo(code, encryptedData, iv);
    if (!shareInfo) {
      return this.fail('绑定失败');
    }
    // 绑定用户和群
    await this.groupService.bindUserToGroup(shareInfo.opengid, this.baseCtx.user.id);
    return this.ok();
  }
  
  /**
   * 用户是否绑定群
   */
  @Post('/isBind')
  async isUserBindGroup(
    @Body('code') code: string,
    @Body('encryptedData') encryptedData: string,
    @Body('iv') iv: string,
  ) {
    const shareInfo = await this.wxService.getMiniShareInfo(code, encryptedData, iv);
    if (!shareInfo) {
      return this.fail('获取失败');
    }
    const userId = this.baseCtx.user.id;
    return this.ok(await this.groupService.isUserBindGroup(userId, shareInfo.opengid));
  }

  /**
   * 获取群DPS排行榜
   */
  @Post('/dpsRank')
  async getGroupDpsRank(
    @Body('code') code: string,
    @Body('encryptedData') encryptedData: string,
    @Body('iv') iv: string,
  ) {
    const shareInfo = await this.wxService.getMiniShareInfo(code, encryptedData, iv);
    if (!shareInfo) {
      return this.fail('获取失败');
    }
    return this.ok(await this.groupService.getGroupDpsRank(shareInfo.opengid));
  }

  /**
   * 获取我的群排名
   */
  @Post('/myRank')
  async getPersonalRank(
    @Body('code') code: string,
    @Body('encryptedData') encryptedData: string,
    @Body('iv') iv: string,
  ) {
    const shareInfo = await this.wxService.getMiniShareInfo(code, encryptedData, iv);
    if (!shareInfo) {
      return this.fail('获取失败');
    }
    const userId = this.baseCtx.user.id;
    return this.ok(await this.groupService.getMyGroupRank(userId, shareInfo.opengid));
  }
}

import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post } from '@midwayjs/core';
import { UserInfoService } from '../../service/info';
import { UserInfoEntity } from '../../entity/info';
import { QRCODE_TYPE } from '../../../../comm/const';
import { UserLoginService } from '../../service/login.service';
import { UserAutoReplyDTO } from '../../dto/info';
import { InviteService } from '../../service/invite';

/**
 * 用户信息
 */
@CoolController({
  api: [],
  entity: UserInfoEntity,
})
export class AppUserInfoController extends BaseController {
  @Inject()
  ctx;

  @Inject()
  userInfoService: UserInfoService;

  @Inject()
  userLoginService: UserLoginService;

  @Inject()
  inviteService: InviteService;

  @Get('/person', { summary: '获取用户信息' })
  async person() {
    return this.ok(await this.userInfoService.person(this.ctx.user.id));
  }

  @Post('/updatePerson', { summary: '更新用户信息' })
  async updatePerson(@Body() body) {
    return this.ok(
      await this.userInfoService.updatePerson(this.ctx.user.id, body)
    );
  }

  @Post('/updateAvatar', { summary: '更新用户头像' })
  async updateAvatar(@Body('avatarUrl') avatarUrl: string) {
    if (!avatarUrl) {
      return this.fail('头像不能为空');
    }
    await this.userInfoService.updateAvatar(this.ctx.user.id, avatarUrl);
    return this.ok();
  }

  @Post('/updatePassword', { summary: '更新用户密码' })
  async updatePassword(
    @Body('password') password: string,
    @Body('code') code: string
  ) {
    await this.userInfoService.updatePassword(this.ctx.user.id, password, code);
    return this.ok();
  }

  @Post('/logoff', { summary: '注销' })
  async logoff() {
    // await this.userLogoffService.logoff(this.ctx.user.id);
    return this.ok();
  }

  @Post('/bindPhone', { summary: '绑定手机号' })
  async bindPhone(@Body('phone') phone: string, @Body('code') code: string) {
    await this.userInfoService.bindPhone(this.ctx.user.id, phone, code);
    return this.ok();
  }

  @Post('/bindPhoneBF', { summary: '绑定手机号(大脚)' })
  async bindPhoneBF(@Body('phone') phone: string, @Body('code') code: string) {
    await this.userInfoService.bindPhoneBF(this.ctx.user.id, phone, code);
    return this.ok();
  }

  @Post('/miniPhone', { summary: '绑定小程序手机号' })
  async miniPhone(@Body() body) {
    const { code, encryptedData, iv } = body;
    return this.ok(
      await this.userInfoService.miniPhone(
        this.ctx.user.id,
        code,
        encryptedData,
        iv
      )
    );
  }

  @Get('/wxQrcode', { summary: '获取微信绑定二维码' })
  public async qrCode() {
    return this.ok(await this.userLoginService.generateQRCode(QRCODE_TYPE.BIND))
  }

  @Get('/wxQrcodeStatus', { summary: '轮询用户微信绑定状态' })
  public async qrCodeStatus() {
    const uuid = this.ctx.user.id
    const result = await this.userInfoService.getQrBindStatus(uuid)
    return this.ok(result)
  }

  @Post('/updateAutoReply', { summary: '更新自动回复' })
  public async updateAutoReply(@Body() body: UserAutoReplyDTO) {
    const userId = this.ctx.user.id
    return this.ok(await this.userInfoService.updateAutoReply(userId, body))
  }

  @Get('/inviteCode', { summary: '获取用户邀请码' })
  async getUserInviteCode() {
    return this.ok(
      await this.inviteService.getUserInviteCode(this.ctx.user.id)
    );
  }
}

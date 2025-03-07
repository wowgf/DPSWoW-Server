import {
  CoolController,
  BaseController,
  CoolUrlTag,
  TagTypes,
  CoolTag,
} from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { BaseSysLoginService } from '../../../base/service/sys/login';
import { QRCODE_TYPE } from '../../../../comm/types';
import * as xml2js from 'xml2js';
import { BigFootAuthService } from '../../../bigfoot/service/auth';
import { UserInfoService } from '../../service/info';
import { UserLoginInviteService } from '../../service/loginInvite.service';

/**
 * 登录
 */
@CoolUrlTag()
@CoolController()
export class AppUserLoginController extends BaseController {
  @Inject()
  userLoginService: UserLoginInviteService;

  @Inject()
  userInfoService: UserInfoService;

  @Inject()
  baseSysLoginService: BaseSysLoginService;

  @Inject()
  bigfootService: BigFootAuthService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/mini', { summary: '小程序登录' })
  async mini(@Body() body) {
    const { code, encryptedData, iv } = body;
    return this.ok(await this.userLoginService.mini(code, encryptedData, iv));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/mp', { summary: '公众号登录' })
  async mp(@Body('code') code: string) {
    return this.ok(await this.userLoginService.mp(code));
  }

  // @CoolTag(TagTypes.IGNORE_TOKEN)
  // @Post('/wxApp', { summary: '微信APP授权登录' })
  // async app(@Body('code') code: string) {
  //   return this.ok(await this.userLoginService.wxApp(code));
  // }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/phone', { summary: '手机号登录注册' })
  async phone(
    @Body('phone') phone: string,
    @Body('smsCode') smsCode: string,
    @Body('inviteCode') inviteCode: string,
    @Body('clientId') clientId: string,
    @Body('friendCode') friendCode?: string,
  ) {
    if (!phone || !smsCode) {
      return this.fail('缺少参数');
    }
    return this.ok(await this.userLoginService.phone(phone, smsCode, inviteCode, clientId, friendCode));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/phone_bf', { summary: '手机号登录注册(大脚)' })
  async phone_bf(
    @Body('phone') phone: string,
    @Body('smsCode') smsCode: string,
    @Body('ref') ref: string,
    @Body('registerChannel') registerChannel: string,
    @Body('inviteCode') inviteCode: string,
    @Body('clientId') clientId: string,
    @Body('friendCode') friendCode?: string,
  ) {
    if (!phone || !smsCode) {
      return this.fail('缺少参数');
    }
    // TODO registerChannel没啥用，会变 应该log登录记录
    return this.ok(await this.bigfootService.phoneLogin(phone, smsCode, 'login', registerChannel, ref, inviteCode, clientId, friendCode));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/bigfoot', { summary: '大脚token登录' })
  async bigfootLogin(@Body('token') token: string, @Body('ref') ref: string) {
    return this.ok(await this.bigfootService.bigfootLogin(token, ref));
  }

  // @CoolTag(TagTypes.IGNORE_TOKEN)
  // @Post('/uniPhone', { summary: '一键手机号登录' })
  // async uniPhone(
  //   @Body('access_token') access_token: string,
  //   @Body('openid') openid: string,
  //   @Body('appId') appId: string
  // ) {
  //   return this.ok(
  //     await this.userLoginService.uniPhone(access_token, openid, appId)
  //   );
  // }

  // @CoolTag(TagTypes.IGNORE_TOKEN)
  // @Post('/miniPhone', { summary: '绑定小程序手机号' })
  // async miniPhone(@Body() body) {
  //   const { code, encryptedData, iv } = body;
  //   return this.ok(
  //     await this.userLoginService.miniPhone(code, encryptedData, iv)
  //   );
  // }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/captcha', { summary: '图片验证码' })
  async captcha(
    @Query('type') type: string,
    @Query('width') width: number,
    @Query('height') height: number,
    @Query('color') color: string
  ) {
    return this.ok(
      await this.baseSysLoginService.captcha(type, width, height, color)
    );
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/smsCode_v2', { summary: '获取手机验证码，带图片验证' })
  async smsCode_v2(
    @Body('phone') phone: string,
    @Body('captchaId') captchaId: string,
    @Body('code') code: string
  ) {
    return this.ok(await this.userLoginService.smsCode_v2(phone, captchaId, code));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/smsCode', { summary: '获取手机验证码' })
  async smsCode(@Body('phone') phone: string) {
    return this.ok(await this.userLoginService.smsCode(phone));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/smsCode_bf', { summary: '获取手机验证码(bigfoot)' })
  async smsCode_bf(@Body('phone') phone: string) {
    if (!phone) {
      return this.fail('缺少参数');
    }
    return this.ok(await this.bigfootService.smsCode(phone));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/refreshToken', { summary: '刷新token' })
  public async refreshToken(@Body('refreshToken') refreshToken) {
    return this.ok(await this.userLoginService.refreshToken(refreshToken));
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/qrcode', { summary: '获取微信登录二维码' })
  public async qrCode(
    @Query('inviteCode') inviteCode?: string,
    @Query('friendCode') friendCode?: string,
    @Query('clientId') clientId?: string,
    @Query('ref') ref?: string,
    @Query('registerChannel') registerChannel?: string,
  ) {
    return this.ok(await this.userLoginService.generateQRCode(QRCODE_TYPE.LOGIN, inviteCode, clientId, ref, registerChannel, friendCode));
  }

  /**
   * 用户登录状态(前端轮询)
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/qrcodeStatus', { summary: '轮询用户登录状态' })
  public async qrCodeStatus(@Body('uuid') uuid: string) {
    const result = await this.userLoginService.getQrLoginStatus(uuid)
    if (result) {
      return this.ok(result)
    }
    return this.ok({ token: null })
  }

  /**
   * 微信事件回调（get、post两个方法都得有）
   * 1. 成功后需要用户登录注册
   * @param xml 
   * @returns 
   */
  // @Throttle(2, 1) // 限流
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/qrcode/callback')
  async qrcodeCallbackPost(@Body() xml: any) {
    let xmlStr = ""
    const jsonData = await xml2js.parseStringPromise(xml)
    let returnData = null
    const data: wxCallbackData = jsonData.xml // 实际数据
    // console.log('jsonData:', jsonData)
    // 判断事件类型（扫描带参数二维码事件）
    if (data.MsgType[0] === 'event' && (data.Event[0] === 'SCAN' || data.Event[0] === 'subscribe')) {
      console.log('qrcode:', data.MsgType[0])
      const qrcodeData = this.userLoginService.parseQrcodeData(data.EventKey[0])
      const { type } = JSON.parse(qrcodeData)
      if (type === 'login') {
        xmlStr = await this.userLoginService.qrCodeLoginCallback(data)
      }
      if (type === 'bind') {
        xmlStr = await this.userInfoService.qrCodeBind(data)
      }
    }
    // 返回公众号登录消息
    return this.baseCtx.body = xmlStr
    // return this.baseCtx.body = 'success'
  }

  /**
   * 微信事件回调
   * 扫描带参数二维码事件
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/qrcode/callback')
  async qrcodeCallback(@Query() query: any) {
    console.log('qrcodeCallback', query)
    return this.baseCtx.body = query.echostr
  }

  // @CoolTag(TagTypes.IGNORE_TOKEN)
  // @Post('/password', { summary: '密码登录' })
  // async password(
  //   @Body('phone') phone: string,
  //   @Body('password') password: string
  // ) {
  //   return this.ok(await this.userLoginService.password(phone, password));
  // }
}

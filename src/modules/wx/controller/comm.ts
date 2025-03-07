import { CoolController, BaseController, CoolTag, TagTypes } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import * as xml2js from 'xml2js';
import { UserLoginService } from '../../user/service/login.service';
import { UserInfoService } from '../../user/service/info';
import { WxMessageType, WxEventType } from '../../../comm/const';
import { WxService } from '../service/wx';

/**
 * 微信通用控制器
 * 处理回调等
 */
@CoolController()
export class CommWxController extends BaseController {

  @Inject()
  userLoginService: UserLoginService

  @Inject()
  userInfoService: UserInfoService

  @Inject()
  wxService: WxService

  /**
   * 微信事件回调
   * 扫描带参数二维码事件
   */
  @Get('/qrcode/callback')
  async qrcodeCallback(@Query() query: any) {
    console.log('qrcodeCallback', query)
    return this.baseCtx.body = query.echostr
  }

  /**
   * 微信事件回调
   * 1. 成功后需要用户登录注册
   * @param xml 
   * @returns 
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/callback')
  async qrcodeCallbackPost(@Body() xml: any) {
    let returnXmlStr = 'success'; // 返回给mp的数据
    const jsonData = await xml2js.parseStringPromise(xml);
    const wxData: wxCallbackData = jsonData.xml; // 接受的数据，转成json了

    // 根据消息类型处理
    switch (wxData.MsgType[0]) {
      case WxMessageType.EVENT:
        // 事件消息处理
        switch (wxData.Event[0]) {
          case WxEventType.SCAN:
          case WxEventType.SUBSCRIBE:
            // 处理扫码事件
            const qrcodeData = this.userLoginService.paraseQrcodeData(wxData.EventKey[0]);
            const { type } = JSON.parse(qrcodeData);
            if (type === 'login') {
              returnXmlStr = await this.userLoginService.qrCodeLoginCallback(wxData);
            }
            if (type === 'bind') {
              returnXmlStr = await this.userInfoService.qrCodeBind(wxData)
            }
            break;

          case WxEventType.UNSUBSCRIBE:
            // 用户取消关注，可以在这里清理用户相关数据
            // this.baseCtx.logger.info(`用户取消关注: ${wxData.FromUserName[0]}`);
            break;

          case WxEventType.CLICK:
            // 处理菜单点击事件
            // returnXmlStr = await this.wxService.replyMessage(
            //   wxData,
            //   WxMessageType.TEXT,
            //   '您点击了菜单，我们会尽快处理您的请求'
            // );
            break;
        }
        break;

      case WxMessageType.TEXT:
        // 处理文本消息
        const userContent = wxData.Content[0];  // 获取用户发送的文本内容
        const replyContent = await this.wxService.handleKeywordReply(userContent);
        returnXmlStr = await this.wxService.replyMessage(wxData.FromUserName[0], WxMessageType.TEXT, replyContent);
        break;

      // 处理图片消息
      case WxMessageType.IMAGE:
        // 处理图片消息
        returnXmlStr = await this.wxService.replyMessage(wxData.FromUserName[0], WxMessageType.TEXT, '图片已收到，谢谢分享！');
        break;

      default:
      // 其他类型消息的默认回复
      // returnXmlStr = await this.wxService.replyMessage(
      //   wxData,
      //   WxMessageType.TEXT,
      //   ''
      // );
    }

    return this.baseCtx.body = returnXmlStr;
  }

  /**
   * 原版，微信事件回调
   * 1. 成功后需要用户登录注册
   * @param xml 
   * @returns 
   */
  @Post('/qrcode/callback_v1')
  async qrcodeCallbackPost_v1(@Body() xml: any) {
    let returnXmlStr = '' // 返回给mp的数据
    const jsonData = await xml2js.parseStringPromise(xml)
    // let returnData = null
    const data: wxCallbackData = jsonData.xml // 实际数据
    // console.log('jsonData:', jsonData)
    // 判断事件类型（扫描带参数二维码事件）
    if (data.MsgType[0] === 'event' && (data.Event[0] === 'SCAN' || data.Event[0] === 'subscribe')) {
      // console.log('qrcode:', data.MsgType[0])
      const qrcodeData = this.userLoginService.paraseQrcodeData(data.EventKey[0])
      const { type } = JSON.parse(qrcodeData)
      if (type === 'login') {
        returnXmlStr = await this.userLoginService.qrCodeLoginCallback(data)
      }
      // if (type === 'bind') {
      //   returnXmlStr = await this.userInfoService.qrCodeBind(data)
      // }
    }
    return this.baseCtx.body = returnXmlStr
  }

  /**
   * 获取小程序URLScheme
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/getMiniURLScheme')
  async getMiniURLScheme(@Body() body: any) {
    const { path, query, env_version } = body
    return this.ok(await this.wxService.getMiniURLScheme(path, query, env_version))
  }

  /**
   * 获取小程序码
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/getMiniQRCode')
  async getMiniQRCode(@Body() body: any) {
    const { path, env_version } = body
    return this.ok(await this.wxService.getMiniQRCode(path, env_version))
  }

}

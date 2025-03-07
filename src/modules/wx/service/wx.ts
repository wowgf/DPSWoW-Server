import { Config, Inject, InjectClient, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import axios from 'axios';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { BaseSysParamService } from '../../base/service/sys/param';
import { Builder } from 'xml2js';
import { WxMessageType } from '../../../comm/const';
import { KeywordService } from './keyword.service';
import { UserWxService } from '../../user/service/wx';

/**
 * 描述
 */
@Provide()
export class WxService extends BaseService {

  @InjectClient(CachingFactory, 'default')
  cache: MidwayCache;

  @Config('module.wx')
  wxConfig: any;

  @Inject()
  baseSysParamService: BaseSysParamService;

  @Inject()
  keywordService: KeywordService;

  @Inject()
  userWxService: UserWxService;

  /**
   * 获取微信access_token
   * @param appid 
   * @param secret 
   * @param type mp\mini
   * @returns 
   * @Doc https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/getStableAccessToken.html
   */
  public async getWxAccessToken(appid?: string, secret?: string, type = 'mp') {
    appid = appid || this.wxConfig.mp.appid
    secret = secret || this.wxConfig.mp.secret
    const ACCESS_TOKEN_RDS_KEY = `cache:wx:accessToken:${type}`
    const token = await this.cache.get(ACCESS_TOKEN_RDS_KEY)
    // 如果redis中有，直接返回
    if (token) return token
    const url = `https://api.weixin.qq.com/cgi-bin/stable_token`
    const res = await axios.post(url, {
      grant_type: 'client_credential',
      appid,
      secret,
      force_refresh: false
    })
    if (res.data.errcode) {
      this.baseCtx.logger.error(res.data.errmsg);
    }
    const accessToken = res.data.access_token
    const expiresIn = res.data.expires_in // 秒
    if (accessToken) {
      // 存入redis token过期时删除
      await this.cache.set(ACCESS_TOKEN_RDS_KEY, accessToken, (expiresIn - 60) * 1000)
    }
    return accessToken
  }

  /**
   * 发送模板消息
   * @param receiveOpenId 接受者openid
   * @param msgData 发送的消息数据
   * @param pageUrl 跳转地址
   * @returns 
   */
  async sendTemplateMessage(receiveOpenId: string, msgData: Object, params: { template_id: string, url?: string, miniprogram?: Object, appid?: string, pagepath?: string }, client_msg_id?: string) {
    const accessToken = await this.getWxAccessToken()
    const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`
    const postData = {
      touser: receiveOpenId,
      template_id: params.template_id,
      url: params.url,
      miniprogram: params.miniprogram,
      data: msgData,
      // client_msg_id // 防重入id。对于同一个openid + client_msg_id, 只发送一条消息,10分钟有效,超过10分钟不保证效果
    }
    // if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
    //   delete postData.client_msg_id
    // }
    const res = await axios.post(url, postData)
    // console.log(res.data);
    if (res.data.errcode) {
      this.baseCtx.logger.error(res.data.errmsg);
    }
    return res.data
  }

  /**
   * 发送订阅消息
   * @param receiveId 接受者openid
   * @param templateId 
   * @param pageUrl 跳转地址
   * @returns 
   */
  async sendSubMessage(receiveOpenId: string, templateId: string, msgData?: Object, pageUrl?: string, miniprogram?: Object) {
    const accessToken = await this.getWxAccessToken()
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/bizsend?access_token=${accessToken}`
    const postData = {
      access_token: accessToken,
      touser: receiveOpenId,
      template_id: templateId,
      page: pageUrl,
      miniprogram,
      data: msgData
    }
    const res = await axios.post(url, postData)
    // console.log(res);

    if (res.data.errcode) {
      this.baseCtx.logger.error(res.data.errmsg);
    }
    return res.data
  }

  async getFollowers() {
    const accessToken = await this.getWxAccessToken()
    const url = `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${accessToken}`
    const res = await axios.get(url)
    // console.log(res);
    return res.data
  }

  /**
   * 回复消息
   * @param toUserName 接收方帐号（收到的OpenID）
   * @param fromUserName 开发者微信号
   * @param msgType 消息类型：text、image、voice、video、music、news
   * @param content 消息内容
   * @returns XML格式的回复消息
   */
  async replyMessage(toUserName: string, msgType: string, content: any) {
    const builder = new Builder();
    const messageObj: any = {
      xml: {
        ToUserName: toUserName,
        FromUserName: this.wxConfig.mp.accountName,
        CreateTime: Date.now(),
        MsgType: msgType,
      }
    };

    switch (msgType) {
      case WxMessageType.TEXT:
        messageObj.xml.Content = content;
        break;
      case WxMessageType.IMAGE:
        messageObj.xml.Image = {
          MediaId: content.mediaId
        };
        break;
      case WxMessageType.VOICE:
        messageObj.xml.Voice = {
          MediaId: content.mediaId
        };
        break;
      case WxMessageType.VIDEO:
        messageObj.xml.Video = {
          MediaId: content.mediaId,
          Title: content.title || '',
          Description: content.description || ''
        };
        break;
      case WxMessageType.MUSIC:
        messageObj.xml.Music = {
          Title: content.title || '',
          Description: content.description || '',
          MusicUrl: content.musicUrl || '',
          HQMusicUrl: content.hqMusicUrl || '',
          ThumbMediaId: content.thumbMediaId
        };
        break;
      case WxMessageType.NEWS:
        messageObj.xml.ArticleCount = content.articles.length;
        messageObj.xml.Articles = {
          item: content.articles.map(article => ({
            Title: article.title,
            Description: article.description || '',
            PicUrl: article.picUrl || '',
            Url: article.url || ''
          }))
        };
        break;
    }

    return builder.buildObject(messageObj);
  }

  /**
   * 处理关键词回复
   * @param content 用户发送的内容
   * @returns 回复内容
   */
  async handleKeywordReply(content: string): Promise<string> {
    return this.keywordService.getReply(content);
  }

  /**
   * 获取小程序 URL Scheme
   * @param path 小程序路径
   * @param query 小程序参数
   * @returns 
   * @Doc https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/url-scheme/generateScheme.html
   */
  async getMiniURLScheme(path?: string, query?: string, env_version?: string) {
    const accessToken = await this.getWxAccessToken(this.wxConfig.mini.appid, this.wxConfig.mini.secret, 'mini')
    const url = `https://api.weixin.qq.com/wxa/generatescheme?access_token=${accessToken}`
    const postData = {
      jump_wxa: {
        path,
        query,
        env_version
      },
      is_expire: true,
      expire_time: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7天有效期
    }
    const res = await axios.post(url, postData)
    if (res.data.errcode) {
      this.baseCtx.logger.error(res.data.errmsg)
    }
    return res.data
  }

  /**
   * 获取小程序码
   * @param path 
   * @param env_version 
   * @returns 
   */
  async getMiniQRCode(path?: string, env_version?: string, codeType?: number) {
    const accessToken = await this.getWxAccessToken(this.wxConfig.mini.appid, this.wxConfig.mini.secret, 'mini')
    const urls = [
      'https://api.weixin.qq.com/wxa/getwxacode',
      'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode',
    ]
    const url = `${urls[codeType || 0]}?access_token=${accessToken}`
    const postData = {
      path,
      env_version,
    }
    const res = await axios.post(url, postData, { responseType: 'arraybuffer' })
    if (res.data.errcode) {
      this.baseCtx.logger.error(res.data.errmsg)
    }
    return res.data
  }

  /**
   * 获取小程序群组信息
   */
  async getMiniShareInfo(code: string, encryptedData, iv) {
    const session = await this.userWxService.miniSession(code)
    if (session.errcode) {
      throw new CoolCommException('获取小程序信息失败，请刷新重试');
    }
    return await this.userWxService.miniDecryptData(encryptedData, iv, session.session_key);
  }
}

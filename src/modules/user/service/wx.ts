import { Config, Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import axios from 'axios';
import * as crypto from 'crypto';
import { v1 as uuid } from 'uuid';
import * as moment from 'moment';
import { CacheManager } from '@midwayjs/cache';
import { WxService } from '../../wx/service/wx';

/**
 * 微信
 */
@Provide()
export class UserWxService extends BaseService {
  @Config('module.user')
  config;

  @Inject()
  cacheManager: CacheManager;

  @Inject()
  wxService: WxService;

  /**
   * 获得微信配置
   * @param appId
   * @param appSecret
   * @param url 当前网页的URL，不包含#及其后面部分(必须是调用JS接口页面的完整URL)
   */
  public async getWxMpConfig(url: string) {
    const access_token = await this.wxService.getWxAccessToken();
    const ticket = await axios.get(
      'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
      {
        params: {
          access_token: access_token,
          type: 'jsapi',
        },
      }
    );
    const { appid } = this.config.wx.mp;
    // 返回结果集
    const result = {
      timestamp: parseInt(moment().valueOf() / 1000 + ''),
      nonceStr: uuid(),
      appId: appid, //appid
      signature: '',
    };
    const signArr = [];
    signArr.push('jsapi_ticket=' + ticket.data.ticket);
    signArr.push('noncestr=' + result.nonceStr);
    signArr.push('timestamp=' + result.timestamp);
    signArr.push('url=' + decodeURI(url));
    // 敏感信息加密处理
    result.signature = crypto
      .createHash('sha1')
      .update(signArr.join('&'))
      .digest('hex')
      .toUpperCase();
    return result;
  }

  /**
   * 获得公众号用户信息
   * @param code
   */
  async mpUserInfo(code) {
    const token = await this.openOrMpToken(code, this.config.wx.mp);
    return await this.openOrMpUserInfo(token);
  }

  /**
   * 根据openid获取用户unionid
   */
  async getMpUserInfoByOpenid(openid: string) {
    const url = `https://api.weixin.qq.com/cgi-bin/user/info`
    const token = await this.wxService.getWxAccessToken()
    const res = await axios.get(url, {
      params: {
        access_token: token,
        openid,
      }
    })
    const userInfo: wxUserInfoResponse = res.data
    return userInfo
  }

  /**
   * （不再更新，此函数放到wx模块下）获得微信accessToken 不用code
   * @param appid
   * @param secret
   */
  // public async getWxAccessToken(type = 'mp') {
  //   const ACCESS_TOKEN_RDS_KEY = 'wx:accessToken'
  //   const token = await this.cacheManager.get(ACCESS_TOKEN_RDS_KEY)
  //   // 如果redis中有，直接返回
  //   if (token) return token
  //   const url = `https://api.weixin.qq.com/cgi-bin/stable_token`
  //   //@ts-ignore
  //   const conf = this.config.wx[type]
  //   const res = await axios.post(url, {
  //     grant_type: 'client_credential',
  //     appid: conf.appid,
  //     secret: conf.secret,
  //   })
  //   const accessToken = res.data.access_token
  //   if (accessToken) {
  //     // 存入redis
  //     await this.cacheManager.set(ACCESS_TOKEN_RDS_KEY, accessToken, { ttl: 60 * 60 * 1 })
  //   }
  //   return accessToken
  // }

  /**
   * 获得用户信息
   * @param token
   */
  async openOrMpUserInfo(token) {
    return await axios
      .get('https://api.weixin.qq.com/sns/userinfo', {
        params: {
          access_token: token.access_token,
          openid: token.openid,
          lang: 'zh_CN',
        },
      })
      .then(res => {
        return res.data;
      });
  }

  /**
   * 获得token
   * @param code
   * @param conf
   */
  async openOrMpToken(code, conf) {
    const result = await axios.get(
      'https://api.weixin.qq.com/sns/oauth2/access_token',
      {
        params: {
          appid: conf.appid,
          secret: conf.secret,
          code,
          grant_type: 'authorization_code',
        },
      }
    );
    return result.data;
  }

  /**
   * 获得小程序session
   * @param code 微信code
   * @param conf 配置
   */
  async miniSession(code) {
    const { appid, secret } = this.config.wx.mini;
    const result = await axios.get(
      'https://api.weixin.qq.com/sns/jscode2session',
      {
        params: {
          appid,
          secret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      }
    );

    return result.data;
  }

  /**
   * 获得小程序用户信息
   * @param code
   * @param encryptedData
   * @param iv
   */
  async miniUserInfo(code, encryptedData, iv) {
    const session = await this.miniSession(code);
    if (session.errcode) {
      throw new CoolCommException('登录失败，请重试');
    }
    const info: any = await this.miniDecryptData(
      encryptedData,
      iv,
      session.session_key
    );
    if (info) {
      delete info['watermark'];
      return {
        ...info,
        openid: session['openid'],
        unionid: session['unionid'],
      };
    }
    return null;
  }

  /**
   * 获得小程序手机
   * @param code
   * @param encryptedData
   * @param iv
   */
  async miniPhone(code, encryptedData, iv) {
    const session = await this.miniSession(code);
    if (session.errcode) {
      throw new CoolCommException('获取手机号失败，请刷新重试');
    }
    return await this.miniDecryptData(encryptedData, iv, session.session_key);
  }

  

  /**
   * 小程序信息解密
   * @param encryptedData
   * @param iv
   * @param sessionKey
   */
  async miniDecryptData(encryptedData, iv, sessionKey): Promise<any> {
    sessionKey = Buffer.from(sessionKey, 'base64');
    encryptedData = Buffer.from(encryptedData, 'base64');
    iv = Buffer.from(iv, 'base64');
    try {
      // 解密
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      let decoded = decipher.update(encryptedData, 'binary', 'utf8');
      decoded += decipher.final('utf8');
      decoded = JSON.parse(decoded);
      return decoded;
    } catch (err) {
      throw new CoolCommException('获得信息失败');
    }
  }
}

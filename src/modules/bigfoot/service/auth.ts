import { Config, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import axios from 'axios';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import { UserInfoEntity } from '../../user/entity/info';
import { UserLoginService } from '../../user/service/login.service';
import { BigfootUserInfoEntity } from '../../user/entity/bigfoot';
import { Utils } from '../../../comm/utils';
import { UserLoginInviteService } from '../../user/service/loginInvite.service';
import { InviteCodeService } from '../../invite/service/inviteCode';
import { InviteService } from '../../user/service/invite';

/**
 * 描述
 */
@Provide()
export class BigFootAuthService extends BaseService {

  @Config('module.bigfoot.auth')
  authConfig: any;

  @Inject()
  loginService: UserLoginInviteService;

  @Inject()
  utils: Utils;

  @Inject()
  inviteCodeService: InviteCodeService;

  @Inject()
  inviteService: InviteService;

  @Config('module.bigfoot')
  bfConfig: any;


  /**
   * 验证手机号验证码登录
   * 成功会返回 token
   * @param ref 注册来源 bigfoot wclbox等
   */
  async phoneLogin(phone: string, smsCode: string, type = 'login', channel = 'PC', ref = '', inviteCode = '', clientId?: string, friendCode?: string) {
    const api = `${this.bfConfig.apiHost}/api/login/check-verify`
    const ip = await this.utils.getReqIP(this.baseCtx);
    let bfChannel = ''
    // 渠道字符串转换
    if (ref === 'wclbox') bfChannel = 'WCLBOX';
    if (ref === 'BIGFOOT_CLIENT') bfChannel = 'BIGFOOT_CLIENT'
    const data = {
      bundle: 'com.wowgf.bigfoot',
      version: '1.0.0',
      timestamp: this.generateTimestamp(),
      nonce: this.generateNonce(),
      send_number: phone,
      code: smsCode,
      channel: bfChannel,
      ip,
      signature: '',
    }
    // console.log(data);

    // 生成签名
    data.signature = this.generateSignature(data);

    // 加密后数据
    const EncryptStr = this.getAesEncryptStr(data);
    // 请求验证 验证码有效性
    const res = await axios.post(api, { encryption: EncryptStr });
    // console.log(res.data);
    // code = 0 代表成功 其他则返回错误信息
    if (res.data.code === 0) {
      // 拿到token后请求bigfoot用户信息，然后绑定到我方用户
      const bfToken = res.data.data.access_token
      if (type === 'login') { // 只有是登录注册时才注册新用户，绑定时不操作
        const loginToken = await this.registerUser(bfToken, phone, channel, ref, inviteCode, clientId, friendCode);
        return loginToken;
      }
      return bfToken;
    } else {
      this.baseCtx.logger.error(res.data)
      throw new Error('验证码不正确或已过期');
      // return { code: res.data.code, msg: res.data.msg };
    }
  }

  /**
   * 登录注册，并绑定大脚用户
   * @param bfToken 大脚短信验证码登录成功后返回的token
   * @param phone 手机号
   * @returns 
   */
  async registerUser(bfToken: string, phone: string, channel: string, ref = '', inviteCode = '', clientId?: string, friendCode?: string) {
    const BF_CHANNEL = 'BIGFOOT_CLIENT';
    let bfUserInfo = null;
    let user = await UserInfoEntity.findOneBy({ phone });
    let friendInfo;
    if (!phone) user = null;
    if (!user) { // 无用户则新注册
      
      // 验证邀请码
      if (!friendCode) {
        // await this.inviteCodeService.validateInviteCode(inviteCode, clientId, false);
      }

      // 验证好友验证码
      if (friendCode) {
        friendInfo = await this.inviteService.validateInviteCode(friendCode)
      }

      // 手机号后四位
      const phoneEnd = phone?.substring(phone.length - 4);
      let userSaveData = {
        avatarUrl: await this.loginService.generateAvatar(),
        nickName: this.loginService.generateNickName(phoneEnd),
        phone, registerChannel: channel, registerRef: ref,
        friendId: friendInfo?.id
      }
      // 注册
      // user = await UserInfoEntity.save({...userSaveData});
      if (ref === BF_CHANNEL) {
        bfUserInfo = await this.getInfoByToken(bfToken);
        const avatarUrl = bfUserInfo?.account.avatar || await this.loginService.generateAvatar()
        // 如果是大脚客户端内登录，且是新注册用户，则更新用户头像和昵称
        userSaveData.avatarUrl = avatarUrl;
        userSaveData.nickName = bfUserInfo?.account.name;
      }
      user = await UserInfoEntity.save({ ...userSaveData });
      // 新用户奖励
      // await this.awardService.rewardNewUser(userInfo.id);
      // if (inviteCode) {
      //   await this.userInfoService.inviteReward(inviteCode, userInfo.id);
      // }
    }
    const bigfootUserInfo = await BigfootUserInfoEntity.findOneBy({ userId: user.id });
    if (!bigfootUserInfo) {
      // 获取大脚用户信息
      bfUserInfo = bfUserInfo || await this.getInfoByToken(bfToken);
      // 绑定大脚用户
      await BigfootUserInfoEntity.save({
        userId: user.id,
        uuid: bfUserInfo.account.uuid,
        avatarUrl: bfUserInfo.account.avatar,
        name: bfUserInfo.account.name,
        sex: bfUserInfo.account.sex,
        age: bfUserInfo.account.age,
        registerTime: bfUserInfo.account.created_at,
        details: bfUserInfo,
      });

    }
    /** 登录成功后逻辑，新用户奖励积分，消耗邀请码 */
    await this.loginService.loginSuccess(user, inviteCode);

    return this.loginService.token({ id: user.id });
  }

  /**
   * 大脚客户端内登录
   * 传递过来参数 ref=BIGOOT_CLIENT&access_token=xxx
   */
  async bigfootLogin(token: string, ref: string) {
    const bfUserInfo = await this.getInfoByToken(token);
    if (!bfUserInfo) {
      this.baseCtx.throw(401, '登录失败');
    }
    // 根据uuid查询用户 有则登录，无则注册
    const bfUser = await BigfootUserInfoEntity.findOneBy({ uuid: bfUserInfo.account.uuid });
    if (bfUser) {
      return this.loginService.token({ id: bfUser.userId });
    }
    // 注册
    const phone = bfUserInfo.account.phone;
    const mzToken = await this.registerUser(token, phone, 'PC', ref);
    return mzToken;
  }

  /**
   * bigfoot那边获取短信验证码
   * 签名：魔兽工坊 com.wowgf.bigfoot
   */
  async smsCode(phone: string) {
    const api = `${this.bfConfig.apiHost}/api/login/phone`
    const data = {
      bundle: 'com.wowgf.bigfoot',
      version: '1.0.0',
      timestamp: this.generateTimestamp(),
      nonce: this.generateNonce(),
      send_number: phone,
      signature: '',
    }
    // 生成签名
    data.signature = this.generateSignature(data);

    // 加密后数据
    const EncryptStr = this.getAesEncryptStr(data);

    await axios.post(api, { encryption: EncryptStr });

  }

  /**
   * 请求大脚API
   * @param token 
   * @returns 
   */
  async getInfoByToken(token: string) {
    const api = `${this.bfConfig.apiHost}/api/account/info`
    const data = {
      bundle: 'com.wowgf.bigfoot',
      version: '1.0.0',
      timestamp: this.generateTimestamp(),
      nonce: this.generateNonce(),
      signature: '',
      core: 1,
    }
    const header = {
      Authorization: token
    }
    // 生成签名
    data.signature = this.generateSignature(data);
    // 加密后数据
    const EncryptStr = this.getAesEncryptStr(data);
    const res = await axios.post(api, { encryption: EncryptStr }, { headers: header });

    // console.log(res.data);
    // code = 0 代表成功 其他则返回错误信息
    if (res.data.code === 0) {
      return res.data.data;
    } else {
      return null
    }
  }

  async saveBigfootUserInfo(bfUserInfo: any, userId) {
    // 绑定大脚用户
    await BigfootUserInfoEntity.save({
      userId: userId,
      uuid: bfUserInfo.account.uuid,
      avatarUrl: bfUserInfo.account.avatar,
      name: bfUserInfo.account.name,
      sex: bfUserInfo.account.sex,
      age: bfUserInfo.account.age,
      registerTime: bfUserInfo.account.created_at,
      details: bfUserInfo,
    });
  }

  /**
   * 生成32位随机字符串
   */
  generateNonce() {
    let str = '';
    for (let i = 0; i < 32; i++) {
      str += Math.floor(Math.random() * 10);
    }
    return str;
  }

  /**
   * 生成签名
   */
  generateSignature(params: { [key: string]: any }): string {
    const authKey = '5pWw5o2u5p2l5rqQ77ya5aSn6ISa5o+S5Lu2IHwg5p+l77ya6a2U5YW95LiW55WM';

    // 1. 排除 signature 参数
    const filteredParams = Object.keys(params)
      .filter(key => key !== 'signature')
      .sort() // 2. 按照参数名的 ASCII 码从小到大排序
      .map(key => `${key}=${params[key]}`) // 3. 生成 URL 键值对的格式
      .join('&');

    // 4. 对结果进行 sha1 加密
    const sha1 = crypto.createHash('sha1');
    sha1.update(filteredParams + authKey);
    return sha1.digest('hex');
  }

  /**
   * 生成10为时间戳
   */
  generateTimestamp(): string {
    return String(Math.floor(new Date().getTime() / 1000));
  }

  getAesEncryptStr(dataToEncrypt: object) {
    return this.aesEncrypt(dataToEncrypt, this.authConfig.key, this.authConfig.iv);
  }

  /**
   *  AES 加密函数
   */
  aesEncrypt(data, key, iv) {
    // 将 JSON 对象转换为字符串
    const jsonString = JSON.stringify(data);

    // 执行 AES 加密
    const encrypted = CryptoJS.AES.encrypt(
      jsonString,
      CryptoJS.enc.Utf8.parse(key), // 密钥
      {
        iv: CryptoJS.enc.Utf8.parse(iv), // 偏移字符串
        mode: CryptoJS.mode.CBC, // 运算模式
        padding: CryptoJS.pad.Pkcs7 // 填充模式
      }
    );

    // 返回 Base64 编码的密文
    return encrypted.toString();
  }
}

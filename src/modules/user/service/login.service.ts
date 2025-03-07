import { Config, Inject, InjectClient, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserInfoEntity } from '../entity/info';
import { UserWxService } from './wx';
import { CoolFile } from '@cool-midway/file';
import * as jwt from 'jsonwebtoken';
import { UserWxEntity } from '../entity/wx';
// import { CoolFile } from '@cool-midway/file';
import { BaseSysLoginService } from '../../base/service/sys/login';
import { UserSmsService } from './sms';
import { v1 as uuid } from 'uuid';
import axios from 'axios';
import { randomUUID } from '@midwayjs/core/dist/util/uuid';
import { Context } from '@midwayjs/koa';
// import { QRCODE_TYPE } from '../../../comm/const';
import * as xml2js from 'xml2js';
import {
  generateRandomString,
  generateUsername,
} from '../../../utils/generateUtils';
import { QRCODE_TYPE } from '../../../comm/types';
import { WxService } from '../../wx/service/wx';
import { BaseSysParamService } from '../../base/service/sys/param';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { BigFootAuthService } from '../../bigfoot/service/auth';
import { UserPointsService } from '../../point/service/userPoint.service';

/**
 * 登录
 */
@Provide()
export class UserLoginService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(UserWxEntity)
  userWxEntity: Repository<UserWxEntity>;

  @Inject()
  ctx: Context;

  @Inject()
  file: CoolFile;

  @Inject()
  userWxService: UserWxService;

  bigfootService: BigFootAuthService;

  // @Inject()
  // wxService: WxService;

  @Inject()
  baseSysLoginService: BaseSysLoginService;

  @Inject()
  userSmsService: UserSmsService;

  @Inject()
  wxService: WxService

  @Inject()
  userPointsService: UserPointsService;

  @Inject()
  baseSysParamService: BaseSysParamService

  @Config('module.wx')
  config: any;

  @Config('module.user.jwt')
  jwtConfig;

  @Config('module.wx')
  wxConfig;

  @InjectClient(CachingFactory, 'default')
  cache: MidwayCache;

  /**
   * 发送手机验证码
   * @param phone
   * @param captchaId
   * @param code
   */
  async smsCode(phone) {
    // 1、检查图片验证码  2、发送短信验证码
    // const check = await this.baseSysLoginService.captchaCheck(captchaId, code)
    // if (!check) {
    //   throw new CoolCommException('图片验证码错误')
    // }
    await this.userSmsService.sendSms(phone);
  }

  async smsCode_v2(phone, captchaId, code) {
    // 1、检查图片验证码  2、发送短信验证码
    const check = await this.baseSysLoginService.captchaCheck(captchaId, code)
    if (!check) {
      throw new CoolCommException('图片验证码错误')
    }
    await this.userSmsService.sendSms(phone);
  }

  /**
   * 手机号登录|注册
   * @param phone
   * @param smsCode
   * @param inviteCode 邀请码
   */
  async phone(phone: string, smsCode: string, inviteCode?: string) {
    // 1、检查短信验证码  2、登录
    const check = await this.userSmsService.checkCode(phone, smsCode);
    // 手机号后四位
    const phoneEnd = phone.substring(phone.length - 4);
    if (check) {
      let user: any = await this.userInfoEntity.findOneBy({ phone });
      if (!user) {
        user = {
          phone,
          username: generateUsername(),
          // unionid: phone,
          registerFrom: 2,
          nickName: this.generateNickName(phoneEnd),
          avatarUrl: await this.generateAvatar(),
          uid: this.generateUID(),
        };
        // 注册
        const userInfo = await this.userInfoEntity.save(user);
        // 新用户奖励，初始化用户积分记录，并赠送1000积分
        this.loginSuccess(userInfo);
        // if (inviteCode) {
        //   await this.userInfoService.inviteReward(inviteCode, userInfo.id);
        // }
      }
      return this.token({ id: user.id });
    } else {
      throw new CoolCommException('验证码错误');
    }
  }

  /**
   * 公众号登录
   * @param code
   * @param isBind 1-绑定 0-直接登录
   */
  async mp(code: string, isBind = false, inviteCode?: any) {
    let wxUserInfo = await this.userWxService.mpUserInfo(code);
    if (wxUserInfo) {
      delete wxUserInfo.privilege;
      // 检查是否已存在用户
      let wxUser = await this.userWxEntity.findOneBy({
        unionid: wxUserInfo.unionid,
      });
      wxUserInfo =
        wxUser ||
        (await this.saveWxInfo(
          {
            openid: wxUserInfo.openid,
            unionid: wxUserInfo.unionid,
            // avatarUrl: wxUserInfo.headimgurl,
            nickName: wxUserInfo.nickname,
            gender: wxUserInfo.sex,
            city: wxUserInfo.city,
            province: wxUserInfo.province,
            country: wxUserInfo.country,
            // userId: this.ctx?.user?.id || null,
          },
          1
        ));
      // 如果是绑定则更新用户的unionid
      if (isBind) {
        if (!this.ctx.user.id) throw new Error('微信登录失败');
        if (wxUserInfo.userId) throw new Error('当前微信已绑定其他用户');
        await this.userInfoEntity.update(
          { id: this.ctx.user.id },
          { unionid: wxUserInfo.unionid }
        );
        await this.userWxEntity.update(
          { unionid: wxUserInfo.unionid },
          { userId: this.ctx.user.id }
        );
        return 'success';
      }
      return this.wxLoginToken(wxUserInfo, inviteCode);
    } else {
      throw new Error('微信登录失败');
    }
  }

  /**
   * 保存微信信息
   * @param wxUserInfo
   * @param type
   * @returns
   */
  async saveWxInfo(wxUserInfo, type) {
    const find: any = { openid: wxUserInfo.openid };
    let wxInfo: any = await this.userWxEntity.findOneBy(find);
    if (wxInfo) {
      wxUserInfo.id = wxInfo.id;
    }
    await this.userWxEntity.save({
      ...wxUserInfo,
      type,
    });
    return wxUserInfo;
  }

  /**
   * 小程序登录
   * @param code
   * @param encryptedData
   * @param iv
   */
  async mini(code, encryptedData, iv) {
    let wxUserInfo = await this.userWxService.miniUserInfo(
      code,
      encryptedData,
      iv
    );
    if (wxUserInfo) {
      // 保存
      wxUserInfo = await this.saveWxInfo(wxUserInfo, 0);
      return await this.wxLoginToken(wxUserInfo);
    }
  }

  /**
   * 微信登录 获得token
   * @param wxUserInfo 微信用户信息
   * @returns
   */
  async wxLoginToken(wxUserInfo: UserWxEntity, inviteCode?: string) {
    const unionid = wxUserInfo.unionid ? wxUserInfo.unionid : wxUserInfo.openid;
    let userInfo: any = await this.userInfoEntity.findOneBy({ unionid });
    if (!userInfo) {
      const avatarUrl =
        (wxUserInfo.avatarUrl &&
          (await this.file.downAndUpload(
            wxUserInfo.avatarUrl,
            uuid() + '.png'
          ))) ||
        (await this.generateAvatar());
      userInfo = {
        unionid,
        nickName: wxUserInfo.nickName,
        avatarUrl,
        gender: wxUserInfo.gender,
        uid: this.generateUID(),
      };
      await this.userInfoEntity.insert(userInfo);
      // 更新userId
      await this.userWxEntity.update(
        { unionid: unionid },
        { userId: userInfo.id }
      );
    }
    return this.token({ id: userInfo.id });
  }

  /**
   * 生成微信公众号二维码
   * 用户扫码后可以触发事件（例如关注）
   * 目前的公众号登录就是扫码关注后即登录注册
   * doc: https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_event_pushes.html
   */
  async generateQRCode(type: QRCODE_TYPE = QRCODE_TYPE.LOGIN, inviteCode?: string) {
    let uuid = '';
    if (type === QRCODE_TYPE.LOGIN) {
      uuid = randomUUID(); // 前端未登录用户的唯一标识
    } else if (type === QRCODE_TYPE.BIND) {
      uuid = this.ctx.user.id;
    }
    const { appid, secret } = this.config.mp;
    const accessToken = await this.wxService.getWxAccessToken(appid, secret);
    const url = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${accessToken}`;
    const qrcodeStr = JSON.stringify({ uuid, type }); // 二维码携带的参数

    const res = await axios.post(url, {
      action_name: 'QR_STR_SCENE',
      action_info: { scene: { scene_str: qrcodeStr } },
      expire_seconds: 60,
    });

    const data: qrCodeTicketResponse = res.data;
    if (data.errcode) {
      this.ctx.logger.error(data.errmsg, '\n此时的token：', accessToken);
    }
    // 保存邀请码
    if (inviteCode) {
      this.cache.set(`QRCode:invite:${uuid}`, inviteCode, 60 * 60 * 1000);
    }
    return { ...data, _id: uuid };
  }

  /**
   * 生成绑定二维码(已登录)
   */
  // async generateBindQRCode() {
  //   const accessToken = await this.userWxService.getWxAccessToken()
  //   const uid = this.ctx.user.id
  //   const url = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${accessToken}`
  //   const res = await axios.post(url, {
  //     action_name: 'QR_LIMIT_STR_SCENE',
  //     action_info: { scene: { scene_str: uid } },
  //     expire_seconds: 60,
  //   })
  //   const data: qrCodeTicketResponse = res.data
  //   return { ...data }
  // }

  /**
   * 通过uuid获得用户登录状况
   * 如果登录了返回token，否则返回token=null
   * @param uuid
   */
  async getQrLoginStatus(uuid: string) {
    const tokenInfo = await this.cache.get(`auth:qrlogin:${uuid}`);
    return tokenInfo;
  }

  /**
   * （微信回调）二维码登录注册
   * 若用户已注册，则把uuid和token存到redis
   * 若用户未注册，则先执行注册逻辑，再把uuid和token存到redis
   * 用户扫码关注公众号 公众号回调此接口
   * @param wxData
   */
  async qrCodeLoginCallback(wxData: wxCallbackData) {
    const openid = wxData.FromUserName[0]
    // 获取用户unionid
    const { unionid } = await this.userWxService.getMpUserInfoByOpenid(openid)
    // console.log('=== openid unionid', openid, unionid);
    // 返回公众号登录消息
    const builder = new xml2js.Builder()

    if (!unionid) return null

    const qrcodeData = this.parseQrcodeData(wxData.EventKey[0]) // 用户前端唯一标识
    const { uuid } = JSON.parse(qrcodeData)
    // redis 取其他数据
    const udata: any = await this.cache.get(`user:login:${uuid}`)
    // let userWx = await this.userWxEntity.findOne({ where: { openid } })
    const userInfo = await this.userInfoEntity.findOne({ where: { unionid } })

    if (userInfo) { // 已注册
      // 生成token
      const tokenInfo = await this.token({ id: userInfo.id })
      // 存到redis(表示该用户已登录)
      await this.loginUser(uuid, tokenInfo)
    } else {
      // 未注册
      // // 获取用户unionid
      // const { unionid } = await this.userWxService.getMpUserInfoByOpenid(openid)
      // 随机生成昵称
      const nickName = this.generateNickName()
      // 注册userInfo和userWx
      const userInfo = await this.userInfoEntity.save({
        unionid,
        nickName,
        registerChannel: udata?.channel,
        avatarUrl: await this.generateAvatar(),
        lastLoginTime: new Date(),
        // deviceId: !deviceUser && udata.deviceId ? udata.deviceId : deviceUser.deviceId, // 如果有设备id并且该设备未注册，则使用改设备id
      })

      await this.userWxEntity.insert({
        openid,
        unionid,
        userId: userInfo.id,
        type: 1,  // 公众号
      })
      // 生成token
      const tokenInfo = await this.token({ id: userInfo.id })
      await this.loginUser(uuid, tokenInfo)
    }
    // 返回公众号登录消息
    const xmlStr = builder.buildObject({
      xml: {
        ToUserName: wxData.FromUserName[0],
        FromUserName: this.wxConfig.mp.accountName,
        CreateTime: Date.now(),
        MsgType: 'text',
        Content: '欢迎登录魔兽工坊，让魔兽玩家没有难做的装备😄',
      }
    })
    console.log('==== xmlStr', xmlStr);

    return xmlStr
  }

  /**
   * 刷新token
   * @param refreshToken
   */
  async refreshToken(refreshToken) {
    try {
      const info = jwt.verify(refreshToken, this.jwtConfig.secret);
      if (!info['isRefresh']) {
        throw new CoolCommException('token类型非refreshToken');
      }
      const userInfo = await this.userInfoEntity.findOneBy({
        id: info['id'],
      });
      return this.token(userInfo);
    } catch (e) {
      throw new CoolCommException(
        '刷新token失败，请检查refreshToken是否正确或过期'
      );
    }
  }

  /**
   * 获得token
   * @param info
   * @returns
   */
  async token(info) {
    const { expire, refreshExpire } = this.jwtConfig;
    return {
      expire,
      token: await this.generateToken(info),
      refreshExpire,
      refreshToken: await this.generateToken(info, true),
    };
  }

  /**
   * 生成token
   * @param tokenInfo 信息
   */
  async generateToken(info, isRefresh = false) {
    const { expire, refreshExpire, secret } = this.jwtConfig;
    const tokenInfo = {
      isRefresh,
      ...info,
    };
    return jwt.sign(tokenInfo, secret, {
      expiresIn: isRefresh ? refreshExpire : expire,
    });
  }

  /**
   * 解析二维码里的数据
   * @param eventKey
   * @returns
   */
  parseQrcodeData(eventKey: string) {
    // 如果是qrscene_开头的，去掉qrscene_
    return eventKey.startsWith('qrscene_')
      ? eventKey.replace('qrscene_', '')
      : eventKey
  }

  /**
   * 随机生成头像
   */
  async generateAvatar() {
    let avatarList = await this.baseSysParamService.dataByKey('defaultAvatar');
    const pre = (avatarList && avatarList[0] && avatarList) || [
      'https://maiziit-common.oss-cn-beijing.aliyuncs.com/images/avatar/aizhDefaultAvatar.png',
    ];
    const avatar = pre[Math.floor(Math.random() * pre.length)];
    return avatar;
  }

  /**
   * 随机生成昵称
   */
  generateNickName(endStr?: string) {
    const pre = [
      "兽人萨满", "狂暴战士", "巨魔猎人",
      "暗影牧师", "血精灵法师", "亡灵盗贼",
      "牛头人德鲁伊", "矮人圣骑士", "暗夜精灵猎人",
      "人类战士", "德莱尼萨满", "地精工程师",
      "熊猫人武僧", "狼人战士", "虚空精灵法师",
      "光铸德莱尼圣骑士", "暗夜精灵德鲁伊", "兽人术士",
      "血精灵圣骑士", "亡灵法师", "巨魔萨满",
      "牛头人战士", "矮人猎人", "暗夜精灵盗贼",
      "人类法师", "德莱尼牧师", "地精术士",
      "熊猫人猎人", "狼人德鲁伊", "虚空精灵牧师",
      "光铸骑士", "暗夜精灵法师", "兽人猎人",
      "血精灵盗贼", "亡灵术士", "巨魔战士",
      "牛头人牧师", "矮人法师", "暗夜精灵战士",
    ];
    const preStr = pre[Math.floor(Math.random() * pre.length)];
    if (endStr) {
      return preStr + endStr;
    }
    const nickName = preStr + Math.floor(Math.random() * 10000)
    return nickName
  }

  /**
   * 用户登录
   */
  async loginUser(uuid: string, tokenInfo: any) {
    // 存到redis(表示该用户已登录)
    await this.cache.set(`auth:qrlogin:${uuid}`, tokenInfo, 60 * 60 * 1000);
  }

  /**
   * 登录成功之后执行方法
   */
  async loginSuccess(userInfo: UserInfoEntity) {
    // 新用户奖励，初始化用户积分记录，并赠送1000积分
    await this.userPointsService.addPoints(userInfo.id, 1000, '新用户注册赠送');
  }

  /**
   * 解析二维码里的数据
   * @param eventKey
   * @returns
   */
  paraseQrcodeData(eventKey: string) {
    // 如果是qrscene_开头的，去掉qrscene_
    return eventKey.startsWith('qrscene_')
      ? eventKey.replace('qrscene_', '')
      : eventKey;
  }

  /**
   * 生成UID
   */
  generateUID() {
    return generateRandomString(9);
  }

  /**
   * 解析用户uuid
   * EventKey: [ '6343434a-b4a8-48a8-86a9-09e172e0d669' ] // or qrscene_b5788ba2-8b18-426b-b36a-c0787e0eb945
   */
  // parseUserUuid(eventKey: string) {
  //   // 如果是qrscene_开头的，去掉qrscene_
  //   return eventKey.startsWith('qrscene_')
  //     ? eventKey.replace('qrscene_', '')
  //     : eventKey
  // }
}

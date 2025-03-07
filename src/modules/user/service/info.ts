import { Config, Inject, InjectClient, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { UserInfoEntity } from '../entity/info';
import { v1 as uuid } from 'uuid';
import { UserSmsService } from './sms';
import * as md5 from 'md5';
import { PluginService } from '../../plugin/service/info';
import { UserWxService } from './wx';
import { BigFootAuthService } from '../../bigfoot/service/auth';
import { UserWxEntity } from '../entity/wx';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { UserLoginService } from './login.service';
import * as xml2js from 'xml2js';
import { UserPointsService } from '../../point/service/userPoint.service';

/**
 * 用户信息
 */
@Provide()
export class UserInfoService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(UserWxEntity)
  userWxEntity: Repository<UserWxEntity>;

  @Inject()
  pluginService: PluginService;

  @Inject()
  userSmsService: UserSmsService;

  @Inject()
  userWxService: UserWxService;

  @Inject()
  bigfootService: BigFootAuthService;

  @Inject()
  userLoginService: UserLoginService;

  @Inject()
  userPointsService: UserPointsService;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @Config('module.user.wx')
  wxConfig;

  /**
   * 绑定小程序手机号
   * @param userId
   * @param code
   * @param encryptedData
   * @param iv
   */
  async miniPhone(userId: number, code: any, encryptedData: any, iv: any) {
    const phone = await this.userWxService.miniPhone(code, encryptedData, iv);
    await this.userInfoEntity.update({ id: Equal(userId) }, { phone });
    return phone;
  }

  /**
   * 获取用户信息，关联工匠信息
   * @param id
   * @returns
   */
  async person(id) {
    const info = await this.userInfoEntity
      .createQueryBuilder('u')
      // .leftJoin('app_user_points', 'p', 'u.id = p.userId')
      .select([
        'u.id',
        'u.nickName',
        'u.avatarUrl',
        'u.phone',
        'u.gender',
        'u.gameInfo',
        'u.createTime',
        'u.updateTime',
        'u.unionid',
        'u.introduction',
        'u.isOpenChat',
        'u.lastActiveTime',
        // 'p.points'
      ])
      .where('u.id = :id', { id })
      .getOne();
    if (info) {
      const points = await this.userPointsService.getPoints(id);
      return { ...info, points };
    }
    return info;
  }

  /**
   * 注销
   * @param userId
   */
  async logoff(userId: number) {
    await this.userInfoEntity.update(
      { id: userId },
      {
        status: 2,
        phone: null,
        unionid: null,
        nickName: `已注销-00${userId}`,
        avatarUrl: null,
      }
    );
  }

  /**
   * 更新用户信息
   * @param id
   * @param param
   * @returns
   */
  async updatePerson(id, param) {
    const info = await this.person(id);
    if (!info) throw new CoolCommException('用户不存在');
    try {
      // 修改了头像要重新处理
      // if (param.avatarUrl && info.avatarUrl != param.avatarUrl) {
      //   const file = await this.pluginService.getInstance('upload');
      //   param.avatarUrl = await file.downAndUpload(
      //     param.avatarUrl,
      //     uuid() + '.png'
      //   );
      // }
    } catch (err) { }
    try {
      // TODO显示更新
      delete param.password; delete param.status;
      return await this.userInfoEntity.update({ id }, param);
    } catch (err) {
      throw new CoolCommException('更新失败，参数错误或者手机号已存在');
    }
  }

  /**
   * 更新用户头像
   */
  async updateAvatar(id, avatarUrl: string) {
    // const file = await this.pluginService.getInstance('upload');
    // avatarUrl = await file.downAndUpload(avatarUrl, uuid() + '.png');
    return await this.userInfoEntity.update({ id }, { avatarUrl });
  }

  /**
   * 更新密码
   * @param userId
   * @param password
   * @param 验证码
   */
  async updatePassword(userId, password, code) {
    const user = await this.userInfoEntity.findOneBy({ id: userId });
    const check = await this.userSmsService.checkCode(user.phone, code);
    if (!check) {
      throw new CoolCommException('验证码错误');
    }
    await this.userInfoEntity.update(user.id, { password: md5(password) });
  }

  /**
   * 绑定手机号
   * @param userId
   * @param phone
   * @param code
   */
  async bindPhone(userId, phone, code) {
    const check = await this.userSmsService.checkCode(phone, code);
    if (!check) {
      throw new CoolCommException('验证码错误');
    }
    const user = await this.userInfoEntity.findOne({ where: { phone } })

    if (user) {
      throw new CoolCommException('该手机号已绑定其他账号');
    }

    await this.userInfoEntity.update({ id: userId }, { phone });
  }

  /**
   * 绑定大脚手机号
   */
  async bindPhoneBF(userId, phone: string, code: string) {
    const token = await this.bigfootService.phoneLogin(phone, code, 'bind');

    const user = await this.userInfoEntity.findOne({ where: { phone } })
    if (user) {
      throw new CoolCommException('该手机号已绑定其他账号');
    }

    const bfUserInfo = await this.bigfootService.getInfoByToken(token);
    // 绑定大脚用户信息
    this.bigfootService.saveBigfootUserInfo(bfUserInfo, userId);

    return await this.userInfoEntity.update({ id: userId }, { phone });

  }

  /**
   * 获得用户微信绑定状况
   * 成功返回1000 失败返回1001
   * @param uuid
   */
  async getQrBindStatus(uuid: string) {
    const data: any = await this.midwayCache.get(`auth:qrbind:${uuid}`)
    if (!data) return '未绑定'
    if (data.code === 1001) throw new CoolCommException(data.message)
    // 清除缓存
    return 'ok'
  }

  /**
   * 绑定微信
   * @param id
   * @returns
   */
  async qrCodeBind(wxData: wxCallbackData) {
    let res = {
      code: 1000,
      message: '绑定成功',
    }

    const openid = wxData.FromUserName[0]
    const qrcodeData = this.userLoginService.paraseQrcodeData(
      wxData.EventKey[0]
    ) // 用户前端唯一标识
    const { uuid } = JSON.parse(qrcodeData)
    const userId = uuid
    // 获取用户unionid
    const { unionid } = await this.userWxService.getMpUserInfoByOpenid(openid)

    // 如果已经绑定过了，就不再绑定
    const user = await this.userInfoEntity.findOne({
      where: { id: userId, unionid },
    })

    if (user) {
      res.code = 1001
      res.message = '请先解绑'
    } else {
      // 微信已绑定其他账号
      const userinfo = await this.userInfoEntity.findOne({ where: { unionid } })
      if (userinfo) {
        res.code = 1001
        res.message = '该微信已绑定其他账号'
      } else {
        // 一切正常再绑定
        await this.userWxEntity.insert({
          openid,
          unionid,
          userId,
          type: 1,
        })
        // 更新用户unionid
        await this.userInfoEntity.update({ id: userId }, { unionid })
      }
    }
    // 存到redis
    await this.midwayCache.set(`auth:qrbind:${uuid}`, res, 60 * 1000)
    const builder = new xml2js.Builder()
    // 返回公众号登录消息
    return builder.buildObject({
      xml: {
        ToUserName: wxData.FromUserName[0],
        FromUserName: this.wxConfig.mp.accountName,
        CreateTime: Date.now(),
        MsgType: 'text',
        Content: '欢迎登录魔兽工坊，让魔兽玩家没有难做的装备😄',
      }
    })
  }

  /**
   * 记录用户最后一次活跃时间
   * 目前是只要有操作就更新
   */
  async updateLastActiveTime(userId: number, date = new Date()) {
    await this.userInfoEntity.update({ id: userId }, { lastActiveTime: date });
  }

  async updateAutoReply(userId: number, params: any) {
    await this.userInfoEntity.update({ id: userId }, { autoReplyInfo: params });
  }
}

// import { log } from 'util';
import * as moment from 'moment'

/**
 * 生成随机六位验证码
 */
export const getSixRandomCode = () => Math.random().toString().slice(-6)

/**
 * 生成指定长度的随机数
 * @param length 随机生成的长度
 */
export function getRandomNumCode(length: number) {
  return Math.random().toString().slice(-length)
}

/**
 * TODO 待完善
 * 生成唯一订单id
 * @param ctx Context
 */
export function generateOrderNo(endLength = 2) {
  return '' + moment().format('YYYYMMDDHHmmssSS') + getRandomNumCode(endLength)
}

/**
 * TODO 待完善
 * 生成唯一流水号
 */
export function generatePayNo() {
  return '' + new Date().getTime() + getRandomNumCode(4)
}

/**
 * 根据openid生成username
 * @param openid 微信openid
 * @param name 微信name
 */
export function generateUsernameByWxInfo(openid: string, name: string) {
  // 分割openid ’adasd_gfdgdg‘
  const openidSpl = openid.split('_')
  const openidStr = openidSpl[openidSpl.length - 1]
  return name + '_' + openidStr
}

/**
 * 生成唯一需求单编号
 * 量大不可靠，需修改
 * @param ctx Context
 */
export const generateRequirementNo = () => {
  return ('' + new Date().getFullYear() + (new Date().getMonth() + 1) + new Date().getDate()
    + getSixRandomCode())
}

/**
 * 获取手机号前三后四，其余用xxx代替
 * @param str 手机号
 */
export const getHiddenPhone = (str: string) => {
  const xxStr = str.substring(3, str.length - 4)
  return str.replace(xxStr, '****')
}

/**
 * 还原js不精确数值
 * 21.79999999 => 21.8
 * @param n 不精确的数值
 * @param fix fix的位数
 * @returns {number} 精确的值
 */
export const getRealNumber = (n: number, fix = 2) => {
  return Number(n.toFixed(fix))
}

/**
 * 替换邮箱字符如：123456@qq.com => 12****@qq.com
 * @param str 邮箱
 */
export const getHiddenEmail = (str: string) => {
  const index = str.indexOf('@')
  const xxStr = str.substring(2, index)
  let rpStr = ''
  for (let i = 0; i < index - 2; i++) {
    rpStr += '*'
  }
  return str.replace(xxStr, rpStr)
}


/**
 * 私有资源检测
 * @param uid 用户id
 * @param foreignKey 外键id
 * @param Resource Model
 * 
 * @use 
 * if (!await checkOwner(ctx.state.user.uid, 'pid', id, ReceiveInfo))
 *    return ctx.helper.error('非法请求', ILLEGAL_REQUEST)
 */
export const checkOwner = async (uid: any, foreignKey: string, requestId: any, Resource: any) => {
  const res = await Resource.findById(requestId)
  if (!res) return false
  const userId = res[foreignKey]
  return uid === userId
}

/**
 * 私有资源检测
 * @param uid 用户id
 * @param foreignKey 外键id
 * @param Resource Model
 * @param query 查询条件
 * 
 * @use 
 * if (!await checkOwner(ctx.state.user.uid, 'pid', id, ReceiveInfo))
 *    return ctx.helper.error('非法请求', ILLEGAL_REQUEST)
 */
export const checkOwnerByOtherKey = async (uid: any, foreignKey: string, Resource: any, query = {}) => {
  const res = await Resource.findOne({ where: query })
  if (!res) return false
  const userId = res[foreignKey]
  return uid === userId
}

/**
 * 根据两地经纬度计算距离km
 * @param lat1 纬度一
 * @param lng1 经度一
 * @param lat2 纬度二
 * @param lng2 经度二
 */
export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  var radLat1 = lat1 * Math.PI / 180.0
  var radLat2 = lat2 * Math.PI / 180.0
  var a = radLat1 - radLat2
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
  s = s * 6378.137 // 地球半径
  s = Math.round(s * 10000) / 10000
  return s
}

/**
 * 获取商和余
 * @param n1 除数
 * @param n2 被除数
 * @return [quo, rem]
 */
export function getQuotient(n1: number, n2: number) {
  const quotient = Math.floor(n1 / n2)
  const remainder = n1 % n2
  return [quotient, remainder]
}

/**
 * 密码安全等级计算
 */
export const pwdSafe = {
  num: 0, lower: 0, upper: 0, other: 0,
  len: function () {
    return this.num + this.lower + this.upper + this.other
  },
  getScore: function () {
    let sum = 0
    if (this.len() >= 8) {
      sum += 25
    } else if (this.len() > 4) {
      sum += 10
    } else if (this.len() > 0) {
      sum += 5
    }
    if (this.lower > 0 && this.upper > 0) {
      sum += 20
    } else if (this.lower > 0 || this.upper > 0) {
      sum + 10
    }
    if (this.num > 1) {
      sum += 20
    } else if (this.num > 0) {
      sum += 10
    }
    if (this.other > 1) {
      sum += 25
    } else if (this.other > 0) {
      sum += 10
    }
    if (this.num > 0 && this.lower > 0 && this.upper > 0 && this.other > 0) {
      sum += 5
    } else if (this.num > 0 && this.other > 0 && (this.lower > 0 || this.upper > 0)) {
      sum += 3
    } else if (this.num > 0 && (this.lower > 0 || this.upper > 0)) {
      sum += 2
    }
    return sum
  },
  getLevel: function () {
    let s = this.getScore()
    if (s >= 80) {
      return 'high'
    } else if (s > 30) {
      return 'mid'
    }
    return 'low'
  },
  initPass: function (val) {
    for (let i = 0; i < val.length; i++) {
      let c = val.charCodeAt(i);
      if (c >= 48 && c <= 57) {
        pwdSafe.num++;
      } else if (c >= 97 && c <= 122) {
        pwdSafe.lower++;
      } else if (c >= 65 && c <= 90) {
        pwdSafe.upper++;
      } else {
        pwdSafe.other++;
      }
    }
  }
};




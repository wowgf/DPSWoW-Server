import { ModuleConfig } from '@cool-midway/core';
// import { UserMiddleware } from './middleware/app';

/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: '用户模块',
    // 模块描述
    description: 'APP、小程序、公众号等用户',
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    // globalMiddlewares: [UserMiddleware],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    // 短信
    sms: {
      // 验证码有效期，单位秒
      timeout: 60 * 3,
    },
    // 微信配置
    wx: {
      // 小程序
      mini: {
        appid: 'wx06150bea5e60cc9e',
        secret: 'b322fa5ff6f37ef785d610a13232710b',
      },
      // 公众号
      mp: {
        // 魔兽工坊
        // appid: 'wx76cbc3ae27ae583b',  
        // secret: 'b0d374161d0eca84a9327a8c6bbacce8',
        // accountName: 'wow_gf', // 公众号账号名称，必填
        // 测试-AI综合网
        appid: 'wx8dc563b3b20e7f2f',  
        secret: '02e09679a36a4b64c26e1e4c4c1d3446',
        accountName: 'ai-zonghe', // 公众号账号名称，必填
      },
    },
    // jwt
    jwt: {
      // token 过期时间，单位秒
      expire: 60 * 60 * 24 * 10000,
      // 刷新token 过期时间，单位秒
      refreshExpire: 60 * 60 * 24 * 30* 10000,
      // jwt 秘钥
      secret: 'qui8611069f811efb5070964e1f2a72f',
    },
  } as ModuleConfig;
};

import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: '微信模块',
    // 模块描述
    description: '微信相关处理，与具体业务无关',
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    // 小程序
    mini: {
      appid: 'wx06150bea5e60cc9e',
      secret: 'b322fa5ff6f37ef785d610a13232710b',
    },
    // 公众号
    mp: {
        // ---- 魔兽工坊
        appid: 'wx76cbc3ae27ae583b',  
        secret: 'b0d374161d0eca84a9327a8c6bbacce8',
        accountName: 'wow_gf', // 公众号账号名称，必填
        // ----- AI综合网
        // appid: 'wx8dc563b3b20e7f2f',  
        // secret: '02e09679a36a4b64c26e1e4c4c1d3446',
        // accountName: 'ai-zonghe', // 公众号账号名称，必填
        // ----- 麦子it公众号
        // appid: 'wx882dad7bdd04c2ff',
        // secret: '3b47c30f6b3e93f836eaa229465b6ff9',
        // accountName: 'maiziit', // 公众号账号名称，必填
        // ----- 暗黑集合石
        // appid: 'wx443ebc9c9209a624',
        // secret: '46c68674b8b9b1b262262a94e6cb7cca',
        // accountName: 'Diablo4_Stone', // 公众号账号名称，必填
    },
  } as ModuleConfig;
};

import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: '大脚模块',
    // 模块描述
    description: '处理短信验证登录登，获取大脚用户信息',
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    auth: {
      key: '77ya5aSn6ISa5o+S',
      iv: '5pWw5o2u5p2l5rqQ',
    },
    apiHost: 'https://aaa.infinitiesai.com',
  } as ModuleConfig;
};
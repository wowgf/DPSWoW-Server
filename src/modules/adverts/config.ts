import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: '广告模块',
    // 模块描述
    description: '小程序广告观看积分系统',
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    // 模块配置
    config: {
      // 每日观看上限
      dailyViewLimit: 5,
      // 每次观看奖励积分
      pointsPerView: 1000,
    }
  } as ModuleConfig;
};

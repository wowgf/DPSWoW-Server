import { CoolConfig } from '@cool-midway/core';
import { MidwayConfig } from '@midwayjs/core';

/**
 * 本地开发 npm run prod 读取的配置文件
 */
export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: 'host',
        port: 29368,
        username: 'root',
        password: 'pwd',
        database: 'db_wowdps_prod',
        // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
        synchronize: false,
        // 打印日志
        logging: false,
        // 字符集
        charset: 'utf8mb4',
        // 是否开启缓存
        cache: true,
        // 实体路径
        entities: ['**/modules/*/entity'],
      },
    },
  },
  cool: {
    // 是否自动导入数据库，生产环境不建议开，用本地的数据库手动初始化
    initDB: false,
  } as CoolConfig,
} as MidwayConfig;

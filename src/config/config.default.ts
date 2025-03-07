import { CoolConfig } from '@cool-midway/core';
import { MidwayConfig } from '@midwayjs/core';
import { createAdapter } from "@socket.io/redis-adapter";
import { redisStore } from "cache-manager-ioredis-yet";
import Redis, { RedisOptions } from "ioredis";

// redis统一配置
const RedisOptions: RedisOptions = {
  host: "127.0.0.1",
  port: 6379,
  password: "",
  db: 2
}

// socket.io
const pubClient = new Redis(RedisOptions);
const subClient = pubClient.duplicate();

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: 'qui8611069f811e',
  koa: {
    port: 7002,
  },
  // 模板渲染
  view: {
    mapping: {
      '.html': 'ejs',
    },
  },
  // body解析
  bodyParser: {
    enableTypes: ['json', 'form', 'text', 'xml'],
    formLimit: '10mb',
    jsonLimit: '10mb',
    textLimit: '10mb',
    xmlLimit: '10mb',
  },
  // 静态文件配置
  staticFile: {
    buffer: true,
  },
  // 文件上传
  upload: {
    fileSize: '200mb',
    whitelist: null,
  },
  // 缓存 可切换成其他缓存如：redis http://www.midwayjs.org/docs/extensions/caching
  cacheManager: {
    clients: {
      default: {
        store: redisStore,
        options: RedisOptions,
      },
    },
  },
  throttler: {
    ttl: 60, //（秒），在该时间段内限制 limit 个数的请求， 超出限流
    limit: 60, // 请求个数限制
    storage: { // 内部存储配置，支持 memory | redis 两种存储方式
      type: 'memory',
    },
    errorMsg: '请求频繁，请稍后再试', //超出限流后的报错信息
  },
  redis: {
    client: RedisOptions,
  },
  // socketio
  socketIO: {
    upgrades: ["websocket"], // 可升级的协议
    adapter: createAdapter(pubClient, subClient),
    // transports: ['websocket'],
    cors: {
      origin: "*",
    }
  },
  bull: {
    // 默认的队列配置
    defaultQueueOptions: {
      // redis: `redis://127.0.0.1:6379`,
      redis: RedisOptions,
    }
  },
  cool: {
    // 已经插件化，本地文件上传查看 plugin/config.ts，其他云存储查看对应插件的使用
    file: {
      'domain': 'https://api.dps.cn'
    },
    redis: RedisOptions,
    // crud配置
    crud: {
      // 插入模式，save不会校验字段(允许传入不存在的字段)，insert会校验字段
      upsert: 'save',
      // 软删除
      softDelete: true,
    },
  } as CoolConfig,
} as MidwayConfig;

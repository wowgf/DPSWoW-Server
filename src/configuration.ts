import * as orm from '@midwayjs/typeorm';
import { Configuration, App, Inject } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import * as view from '@midwayjs/view-ejs';
import * as staticFile from '@midwayjs/static-file';
import * as cron from '@midwayjs/cron';
import * as crossDomain from '@midwayjs/cross-domain';
import * as cool from '@cool-midway/core';
import { ILogger } from '@midwayjs/logger';
import * as upload from '@midwayjs/upload';
import { IMidwayApplication } from '@midwayjs/core';
import * as throttler from 'midway-throttler';
import { ThrottlerGuard } from 'midway-throttler';
import * as redis from '@midwayjs/redis';
import * as socketio from "@midwayjs/socketio";
import { Application as SocketApplication } from '@midwayjs/socketio';
import { SocketTokenMiddleware } from './modules/socket/middleware/token';
import * as cacheManager from '@midwayjs/cache-manager';
import * as pay from "@cool-midway/pay";
import * as bull from '@midwayjs/bull';
import * as file from '@cool-midway/file';
import { SocketService } from './modules/socket/service/socket';
import * as swagger from '@midwayjs/swagger';
// import * as rpc from '@cool-midway/rpc';
import * as task from '@cool-midway/task';

@Configuration({
  imports: [
    // https://koajs.com/
    koa,
    // 是否开启跨域(注：顺序不能乱放！！！) http://www.midwayjs.org/docs/extensions/cross_domain
    crossDomain,
    // 模板渲染 https://midwayjs.org/docs/extensions/render
    view,
    // 静态文件托管 https://midwayjs.org/docs/extensions/static_file
    staticFile,
    // orm https://midwayjs.org/docs/extensions/orm
    orm,
    // 参数验证 https://midwayjs.org/docs/extensions/validate
    validate,
    // 本地任务 http://www.midwayjs.org/docs/extensions/cron
    cron,
    // 文件上传
    upload,
    // cool-admin 官方组件 https://cool-js.com
    cool,
    // 文件管理
    file,
    // socketio http://www.midwayjs.org/docs/extensions/socketio
    socketio,
    // 缓存
    cacheManager,
    // rpc 微服务 远程调用
    // rpc,
    // 任务与队列
    task,
    //文档  http://www.midwayjs.org/docs/extensions/swagger
    swagger,
    // 限流
    throttler,
    // redis缓存
    redis,
    // 支付
    pay,
    // 队列任务
    bull,
    // swagger 文档  http://www.midwayjs.org/docs/extensions/swagger
    // {
    //   component: swagger,
    //   enabledEnvironment: ['local'],
    // },
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: IMidwayApplication;

  @App('socketIO')
  socketApp: SocketApplication;

  @Inject()
  logger: ILogger;

  @Inject()
  socketService: SocketService;

  @Inject()
  bullFramework: bull.Framework;

  async onReady() {
    console.log('应用启动，清理用户socket信息');
    await this.socketService.deleteSocketCache();
    
    this.socketApp.useConnectionMiddleware(SocketTokenMiddleware);
    // 全局守卫配置
    this.app.useGuard(ThrottlerGuard);
  }

  async onStop() {
    // this.midwayCache.set('test', 'test');
    // console.log('应用停止，清理用户socket信息');
    // await this.socketService.deleteSocketCache();
  }

}

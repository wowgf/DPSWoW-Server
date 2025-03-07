import { Middleware } from '@midwayjs/decorator';
import * as _ from 'lodash';
import { NextFunction, Context } from '@midwayjs/koa';
import { IMiddleware, InjectClient } from '@midwayjs/core';
import { BaseSysLogService } from '../service/sys/log';
import { UserInfoService } from '../../user/service/info';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';

/**
 * 日志中间件
 */
@Middleware()
export class BaseLogMiddleware implements IMiddleware<Context, NextFunction> {

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const baseSysLogService = await ctx.requestContext.getAsync(BaseSysLogService);

      baseSysLogService.record(
        ctx,
        ctx.url,
        ctx.req.method === 'GET' ? ctx.request.query : ctx.request.body,
        ctx.user ? ctx.user.id : (ctx.admin ? ctx.admin.userId : null)
      );

      // 更新用户最后活跃时间，缓存30s
      if (ctx?.user?.id) {
        this.updateUserLastActiveTime(ctx, ctx.user.id);
      }

      await next();
    };
  }

  /**
   * 更新用户最后活跃时间
   */
  async updateUserLastActiveTime(ctx: Context, userId: number) {
    const userService = await ctx.requestContext.getAsync(UserInfoService);
    // 获取当前时间戳
    const now = Date.now();
    const timeCache = 30; // 缓存时间s

    // 从 Redis 获取上次更新时间戳
    const lastActiveTime: string = await this.midwayCache.get(`cache:lastActiveTime:${userId}`);
    if (!lastActiveTime || now - parseInt(lastActiveTime) > timeCache * 1000) {
      // 更新用户最后活跃时间
      await userService.updateLastActiveTime(userId);
      // 更新 Redis 中的时间戳
      await this.midwayCache.set(`cache:lastActiveTime:${userId}`, now.toString());
    }
  }
}

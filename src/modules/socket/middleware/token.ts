import { Config, Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/socketio';
import * as jwt from 'jsonwebtoken';

@Middleware()
export class SocketTokenMiddleware {

  @Config('module.user.jwt')
  jwtConfig;

  ignoreUrls: string[] = [];

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const token = ctx.handshake.query.token;
      try {
        // 注入ctx.user
        // @ts-ignore
        ctx.user = jwt.verify(token, this.jwtConfig.secret);
        return await next();
      } catch (error) {
        // @ts-ignore
        ctx.user = {};
        return await next();
      }
    }
  }
}
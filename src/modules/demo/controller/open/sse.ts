import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject } from '@midwayjs/core';
import { Context } from 'koa';
import { PluginService } from '../../../plugin/service/info';
import { PassThrough } from 'stream';

/**
 * 事件流 服务端主动推送
 */
@CoolController()
export class OpenDemoSSEController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  pluginService: PluginService;

  @Get('/call', { summary: '事件流 服务端主动推送' })
  async call() {
    // 设置响应头
    this.ctx.set('Content-Type', 'text/event-stream');
    this.ctx.set('Cache-Control', 'no-cache');
    this.ctx.set('Connection', 'keep-alive');

    const stream = new PassThrough();

    // 发送数据
    const send = (data: any) => {
      stream.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // 获取插件实例
    const instance: any = await this.pluginService.getInstance('ollama');
    // 调用chat
    const messages = [
      { role: 'system', content: '你叫小酷，是个编程助手' },
      { role: 'user', content: '用js写个Hello World' },
    ];
    instance.chat(messages, { stream: true }, res => {
      send(res);
      if (res.isEnd) {
        this.ctx.res.end();
      }
    });

    this.ctx.status = 200;
    this.ctx.body = stream;
  }
}

import { CoolController, BaseController } from '@cool-midway/core';
import { PluginService } from '../../../plugin/service/info';
import { Get, Inject } from '@midwayjs/core';

/**
 * 插件
 */
@CoolController()
export class OpenDemoPluginController extends BaseController {
  @Inject()
  pluginService: PluginService;

  @Get('/invoke', { summary: '调用插件' })
  async invoke() {
    // 获取插件实例
    const instance: any = await this.pluginService.getInstance('ollama');
    // 调用chat
    const messages = [
      { role: 'system', content: '你叫小酷，是一个智能助理' },
      { role: 'user', content: '写一个1000字的关于春天的文章' },
    ];
    for (let i = 0; i < 3; i++) {
      instance.chat(messages, { stream: true }, res => {
        console.log(i, res.content);
      });
    }
    return this.ok();
  }
}

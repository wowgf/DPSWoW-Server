import { CoolEvent, Event } from '@cool-midway/core';
import { EVENT_PLUGIN_READY } from '../../plugin/service/center';

/**
 * 普通事件
 */
@CoolEvent()
export class DemoCommEvent {
  /**
   * 根据事件名接收事件
   * @param msg
   * @param a
   */
  @Event('demo')
  async demo(msg, a) {
    console.log(`comm当前进程的ID是: ${process.pid}`);
    console.log('comm收到消息', msg, a);
  }

  /**
   * 插件已就绪
   */
  @Event(EVENT_PLUGIN_READY)
  async pluginReady() {
    // TODO 插件已就绪
  }
}

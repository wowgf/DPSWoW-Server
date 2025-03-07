import { CoolEvent, Event } from '@cool-midway/core';
import {
  App,
  Config,
  ILogger,
  Inject,
  InjectClient,
  Logger,
} from '@midwayjs/core';
import { IMidwayKoaApplication } from '@midwayjs/koa';
import { PLUGIN_CACHE_KEY, PluginCenterService } from '../service/center';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { PluginTypesService } from '../service/types';

/**
 * 插件事件
 */
@CoolEvent()
export class PluginAppEvent {
  @Logger()
  coreLogger: ILogger;

  @Config('module')
  config;

  @App()
  app: IMidwayKoaApplication;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @Inject()
  pluginCenterService: PluginCenterService;

  @Inject()
  pluginTypesService: PluginTypesService;

  @Event('onServerReady')
  async onServerReady() {
    await this.midwayCache.set(PLUGIN_CACHE_KEY, []);
    this.pluginCenterService.init();
    this.pluginTypesService.reGenerate();
  }
}

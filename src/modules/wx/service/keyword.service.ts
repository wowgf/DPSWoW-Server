import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { BaseSysParamService } from '../../base/service/sys/param';

interface KeywordRule {
  patterns: string[];
  reply: string;
}

interface KeywordConfig {
  keywords: KeywordRule[];
  defaultReply: string;
}

/**
 * 关键词回复服务
 */
@Provide()
export class KeywordService extends BaseService {
  
  @Inject()
  baseSysParamService: BaseSysParamService;

  /**
   * 获取关键词配置
   */
  private async getKeywordConfig(): Promise<KeywordConfig> {
    const config = await this.baseSysParamService.dataByKey('wxKeywordReplayConfig');
    if (!config) {
      // 默认配置
      return {
        keywords: [
          {
            patterns: ['你好', 'hello'],
            reply: '你好！欢迎使用魔兽工坊 😊'
          }
        ],
        defaultReply: '您可以输入"帮助"查看支持的功能'
      };
    }
    return JSON.parse(config);
  }

  /**
   * 获取关键词回复
   * @param content 用户输入内容
   * @returns 回复内容
   */
  async getReply(content: string): Promise<string> {
    const config = await this.getKeywordConfig();
    
    // 转换为小写进行匹配
    const lowerContent = content.toLowerCase();

    // 遍历规则查找匹配
    for (const rule of config.keywords) {
      if (rule.patterns.some(pattern => lowerContent.includes(pattern.toLowerCase()))) {
        return rule.reply;
      }
    }

    // 没有匹配返回默认回复
    return config.defaultReply;
  }

  /**
   * 获取所有关键词规则
   */
  async getAllRules(): Promise<KeywordRule[]> {
    const config = await this.getKeywordConfig();
    return config.keywords;
  }

  /**
   * 获取默认回复
   */
  async getDefaultReply(): Promise<string> {
    const config = await this.getKeywordConfig();
    return config.defaultReply;
  }
}

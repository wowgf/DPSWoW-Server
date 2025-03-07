import { Rule, RuleType } from '@midwayjs/validate';

/**
 * banner查询参数校验
 */
export class BannerQueryDTO {
  @Rule(RuleType.number().allow(null))
  position: number;

  // 是否查询所有
  @Rule(RuleType.number().allow(null))
  isAllPosition: number;
}
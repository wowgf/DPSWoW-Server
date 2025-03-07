import { Rule, RuleType } from '@midwayjs/validate';
/**
 * 自动回复校验
 */
export class UserAutoReplyDTO {

  @Rule(RuleType.number())
  status: 0 | 1;

  @Rule(RuleType.string().allow(''))
  content: string;

}

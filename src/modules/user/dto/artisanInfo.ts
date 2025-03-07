import { Rule, RuleType } from '@midwayjs/validate';
/**
 * 工匠资料参数校验
 */
export class ArtisanInfoDTO {

  @Rule(RuleType.number())
  id: number;

  @Rule(RuleType.string().required())
  gameCharacterName: string;

  @Rule(RuleType.string().required())
  serverName: string;

  @Rule(RuleType.array().required())
  skills: Array<string>;

  @Rule(RuleType.string().allow(''))
  introduction: string;

  @Rule(RuleType.array())
  images: Array<string>;

  @Rule(RuleType.number())
  onlineTime: number;

  @Rule(RuleType.number())
  deliverySpeed: number;

  @Rule(RuleType.number())
  allowSyncData: number;

  @Rule(RuleType.string().allow(''))
  ngaGyUrl: string;

  @Rule(RuleType.array())
  deliveryTimes: any[];

}
/**
 * 更新工匠资料参数校验
 */
export class ArtisanInfoEditDTO {

  @Rule(RuleType.number())
  id: number;

  @Rule(RuleType.string())
  gameCharacterName: string;

  @Rule(RuleType.string())
  serverName: string;

  @Rule(RuleType.array())
  skills: Array<string>;

  @Rule(RuleType.string().allow(''))
  introduction: string;

  @Rule(RuleType.array())
  images: Array<string>;

  @Rule(RuleType.number())
  onlineTime: number;

  @Rule(RuleType.number())
  deliverySpeed: number;

  @Rule(RuleType.number())
  allowSyncData: number;

  @Rule(RuleType.string().allow(''))
  ngaGyUrl: string;

  @Rule(RuleType.array())
  deliveryTimes: any[];

}

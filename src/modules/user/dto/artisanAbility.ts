import { Rule, RuleType } from '@midwayjs/validate';

/**
 * 工匠能力参数校验
 */
export class ArtisanAbilityDTO {

  @Rule(RuleType.number())
  id: number;

  // @Rule(RuleType.string().required().length(50))
  // title: string;

  @Rule(RuleType.number().required())
  categoryId: number;

  // @Rule(RuleType.string().required())
  // categoryName: string;

  @Rule(RuleType.string().required())
  itemName: string;

  // @Rule(RuleType.array().items(RuleType.number()).max(2).min(2))
  // itemLevelRange: number[];

  @Rule(RuleType.number().required().min(1).max(2000))
  itemLevel: number;

  @Rule(RuleType.number().min(1).max(5).required())
  starLevel: number;

  @Rule(RuleType.number().required())
  price: number;

  @Rule(RuleType.string().max(50).allow(''))
  description: string;

  @Rule(RuleType.string().allow('').max(50))
  serverName: string;

  @Rule(RuleType.string().allow('').max(50))
  gameCharacterName: string;

  // @Rule(RuleType.number())
  // onlineTime: number;

  // @Rule(RuleType.number())
  // deliverySpeed: number;

  @Rule(RuleType.array().items(RuleType.string()).max(9))
  images: string[];

  @Rule(RuleType.number().valid(0, 1).default(1))
  status: number;

  @Rule(RuleType.string())
  camp: string;

  @Rule(RuleType.number())
  supportUnionOrder: number;

  @Rule(RuleType.number().allow(null))
  itemId: number;
}
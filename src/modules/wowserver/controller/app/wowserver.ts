import { CoolController, BaseController, CoolUrlTag, TagTypes } from '@cool-midway/core';
import { WowServerDataEntity } from '../../entity/wowserver';

/**
 * 描述
 */
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['list'],
})
@CoolController({
  api: ['info', 'list'],
  entity: WowServerDataEntity,
  listQueryOp: {
    keyWordLikeFields: ['serverName'],
    // fieldEq: ['serverName'],
    where: async () => {
      return [['status = 1']];
    },
    addOrderBy: {
      sort: 'ASC',
    },
  },
})
export class AppWowserverController extends BaseController {}

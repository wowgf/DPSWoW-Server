import { CoolController, BaseController } from '@cool-midway/core';
import { WowServerDataEntity } from '../../entity/wowserver';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: WowServerDataEntity,
  pageQueryOp: {
    keyWordLikeFields: ['serverName', 'status', 'nodeType'],  
    addOrderBy: {
      sort: 'ASC',
    },
  },
})
export class AdminWowserverController extends BaseController {}

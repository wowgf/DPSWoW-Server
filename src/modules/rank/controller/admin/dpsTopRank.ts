import { CoolController, BaseController } from '@cool-midway/core';
import { DpsTopRankEntity } from '../../entity/dpsTopRank.entity';

/**
 * 描述
 */
@CoolController({
  api: ['delete', 'info', 'list', 'page'],
  entity: DpsTopRankEntity,
  pageQueryOp: {
    fieldEq: ['rankType', 'spec', 'characterName', 'serverName', 'className'],
  }
})
export class AdminDpsRankController extends BaseController { }

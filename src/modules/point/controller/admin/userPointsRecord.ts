import { CoolController, BaseController } from '@cool-midway/core';
import { UserPointsRecordEntity } from '../../entity/userPointsRecord';

/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: UserPointsRecordEntity,
  pageQueryOp: {
    fieldEq: ['userId'],
    keyWordLikeFields: ['remark']
  }
})
export class UserPointsAdminRecordController extends BaseController { }

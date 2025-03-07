import { CoolController, BaseController } from '@cool-midway/core';
import { UserAdvertRecord } from '../../entity/userAdvertRecord';

/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: UserAdvertRecord,
  pageQueryOp: {
    keyWordLikeFields: ['advertId'],
    fieldEq: ['status', 'userId', 'rewardType']
  }
})
export class AdminUserAdvertRecordController extends BaseController { }
import { CoolController, BaseController } from '@cool-midway/core';
import { UserPointsEntity } from '../../entity/userPoints';

/**
 * 描述
 */
@CoolController({
  api: ['update', 'info', 'list', 'page'],
  entity: UserPointsEntity,
  pageQueryOp: {
    fieldEq: ['userId', 'type'],
  }
})
export class AdminUserPointsController extends BaseController { }

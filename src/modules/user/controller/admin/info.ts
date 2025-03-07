import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoEntity } from '../../entity/info';
import { UserPointsEntity } from '../../../point/entity/userPoints';

/**
 * 用户信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: UserInfoEntity,
  pageQueryOp: {
    select: ["a.*", "userPoints.points"],
    fieldEq: ['a.id', 'status', 'gender', 'loginType'],
    keyWordLikeFields: ['nickName', 'phone'],
    join: [
      {
        type: 'leftJoin',
        entity: UserPointsEntity,
        alias: 'userPoints',
        condition: 'a.id = userPoints.userId'
      }
    ]
  },
})
export class AdminUserInfoController extends BaseController { }

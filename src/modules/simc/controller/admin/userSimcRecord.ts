import { CoolController, BaseController } from '@cool-midway/core';
import { UserSimcRecordEntity } from '../../entity/userSimcRecord';
import { UserInfoEntity } from '../../../user/entity/info';

/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: UserSimcRecordEntity,
  pageQueryOp: {
    select: ["a.id", "a.userId", "a.simcStr", "simcConfig", "a.status", "a.cost", "a.bestDps", "a.playerInfo", "a.createTime", "userInfo.nickName", "a.type"],
    fieldEq: ['userId'],
    keyWordLikeFields: ['playerInfo'],
    join: [
      {
        type: 'leftJoin',
        entity: UserInfoEntity,
        alias: 'userInfo',
        condition: 'a.userId = userInfo.id'
      }
    ]
  }
})
export class AdminUserSimcRecordController extends BaseController { }

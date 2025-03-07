import { CoolController, BaseController } from '@cool-midway/core';
import { UserInviteEntity } from '../../entity/invite';
import { UserInfoEntity } from '../../entity/info';

/**
 * 描述
 */
@CoolController({
  api: ['list', 'page'],
  entity: UserInviteEntity,
  pageQueryOp: {
    select: [
      'a.points',
      'a.createTime as createTime',
      'b.createTime AS registerTime',
      'b.nickName AS friendNickName',
    ],
    where: async ctx => {
      return [
        // 多个条件一起
        ['a.userId = :userId', { userId: ctx.user.id }],
      ];
    },
    join: [
      {
        entity: UserInfoEntity,
        alias: 'b',
        condition: 'a.friendId = b.id',
        type: 'leftJoin',
      },
    ],
    // addOrderBy: {
    //   'a.createTime': 'desc',
    // },
  },
})
export class AppUserInviteController extends BaseController { }

import { CoolController, BaseController } from '@cool-midway/core';
import { InviteCodeEntity } from '../../entity/inviteCode';
import { Body, Inject, Post } from '@midwayjs/core';
import { InviteCodeService } from '../../service/inviteCode';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: InviteCodeEntity,
  pageQueryOp: {
    // keyWordLikeFields: ['code'],
    fieldEq: ['isUsed', 'type', 'code', 'userId'],
  },
})
export class AdminInviteCodeController extends BaseController {

  @Inject()
  inviteCodeService: InviteCodeService;

  /**
   * 批量生成邀请码
   */
  @Post('/generate')
  async generate(@Body('count') count: number) {
    if (!count || count < 1) {
      return this.fail('生成数量不正确');
    }
    return this.ok(await this.inviteCodeService.generateInviteCode(count));
  }
}

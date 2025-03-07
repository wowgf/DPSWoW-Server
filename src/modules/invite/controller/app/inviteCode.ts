import { CoolController, BaseController, CoolUrlTag, CoolTag, TagTypes } from '@cool-midway/core';
import { InviteCodeEntity } from '../../entity/inviteCode';
import { Body, Inject, Post } from '@midwayjs/core';
import { InviteCodeService } from '../../service/inviteCode';
import { Throttle } from 'midway-throttler';

/**
 * 描述
 */
@CoolUrlTag()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: InviteCodeEntity,
})
export class AppInviteCodeController extends BaseController {

  @Inject()
  inviteCodeService: InviteCodeService;

  /**
   * 校验邀请码
   * 会锁定2分钟
   */
  @Throttle(3, 5)
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/check')
  async check(@Body('inviteCode') inviteCode: string, @Body('clientId') clientId: string) {
    if (!inviteCode) {
      return this.fail('邀请码不能为空');
    }
    return this.ok(await this.inviteCodeService.validateInviteCode(inviteCode, clientId, true));
  }

}

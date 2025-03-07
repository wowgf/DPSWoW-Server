import { CoolController, BaseController } from '@cool-midway/core';
import { UserCharacterEntity } from '../../entity/character';
import { Inject, Post } from '@midwayjs/core';
import { UserCharacterService } from '../../service/character';

/**
 * 描述
 */
@CoolController({
  api: [],
  entity: UserCharacterEntity,
})
export class UserCharacterController extends BaseController {

  @Inject()
  service: UserCharacterService;

  @Inject()
  ctx;

  @Post('/myList', { summary: '获取用户角色列表' })
  async myList() {
    return this.ok(await this.service.userList(this.ctx.user.id));
  }
}

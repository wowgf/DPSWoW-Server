import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { WowDataSpellService } from '../../service/spell';

/**
 * 描述
 */
@CoolController({
})
export class OpenWowDataSpellController extends BaseController {
  @Inject()
  wowDataItemService: WowDataSpellService;

  @Post('/format_list')
  async formatListByIds(@Body('ids') ids: any[]) {
    return this.ok(await this.wowDataItemService.formatSpell(ids));
  }
}

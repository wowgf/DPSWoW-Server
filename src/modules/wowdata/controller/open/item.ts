import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { WowDataItemService } from '../../service/item';

/**
 * 描述
 */
@CoolController({
})
export class OpenWowDataItemController extends BaseController {
  @Inject()
  wowDataItemService: WowDataItemService;

  @Post('/format_gear')
  async formatGear(@Body() gearData: any) {
    return this.ok(await this.wowDataItemService.formatGear(gearData));
  }

  @Post('/format_talents')
  async formatTalents(@Body() talents: any[]) {
    return this.ok(await this.wowDataItemService.formatSpell(talents));
  }
}

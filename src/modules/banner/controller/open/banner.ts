import { CoolController, BaseController } from '@cool-midway/core';
import { BannerEntity } from '../../entity/banner';
import { Get, Inject, Query } from '@midwayjs/core';
import { BannerService } from '../../service/banner';
import { BannerQueryDTO } from '../../dto/banner';

/**
 * 描述
 */
@CoolController({
  api: [],
  entity: BannerEntity,
})
export class OpenBannerController extends BaseController {
  @Inject()
  service: BannerService;

  @Get('/list')
  async getList(@Query() query: BannerQueryDTO) {
    return this.ok(await this.service.list(query));
  }
}

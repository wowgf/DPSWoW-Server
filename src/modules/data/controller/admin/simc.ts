import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject, Query } from '@midwayjs/core';
import { TrackDataService } from '../../service/track';
import { SimcDataService } from '../../service/simc';

/**
 * 描述
 */
@CoolController({
})
export class SimcDataController extends BaseController {

  @Inject()
  simcDataService: SimcDataService;

  @Get('/count')
  async getRank(@Query() query: { startDate?: string, endDate?: string }) {
    let simcCount = await this.simcDataService.getSimcCount(query)
    let simcUserCount = await this.simcDataService.getSimcUserCount(query)
    return this.ok({
      simcCount,
      simcUserCount
    });
  }

}

import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject, Query } from '@midwayjs/core';
import { TrackDataService } from '../../service/track';

/**
 * 描述
 */
@CoolController({
})
export class TrackDataController extends BaseController {

  @Inject()
  trackService: TrackDataService;

  @Get('/rank')
  async getRank(@Query() query: { startDate?: string, endDate?: string }) {
    let rank = await this.trackService.getRank(query)
    return this.ok(rank);
  }

  @Get('/homeHotCardRank')
  async homeHotCardRank(@Query() query: { startDate?: string, endDate?: string }) {
    let track = await this.trackService.analyzeClickHomeHotCard(query)
    return this.ok(track);
  }

}

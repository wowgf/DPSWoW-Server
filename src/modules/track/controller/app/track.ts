import { CoolController, BaseController, TagTypes, CoolTag, CoolUrlTag } from '@cool-midway/core';
import { TrackEntity } from '../../entity/track';
import { Body, Inject, Post } from '@midwayjs/core';
import { TrackService } from '../../service/track';

/**
 * 描述
 */
@CoolController()
@CoolUrlTag()
export class AppTrackController extends BaseController {

  @Inject()
  trackService: TrackService;

  /**
   * 记录行为
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/record')
  async recordTrack(@Body("event") event: string, @Body("params") params: any) {
    const userId = this.baseCtx?.user?.id;
    await this.trackService.recordTrack(userId, event, params);
    return this.ok();
  }
}

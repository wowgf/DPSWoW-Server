import { CoolController, BaseController } from '@cool-midway/core';
import { TrackEntity } from '../../entity/track';

/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: TrackEntity,
  pageQueryOp: {
    fieldEq: ['userId', 'event'],
    keyWordLikeFields: ['event', 'params'],
  }
})
export class AdminTrackController extends BaseController {}

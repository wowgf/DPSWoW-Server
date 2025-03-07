import { CoolController, BaseController } from '@cool-midway/core';
import { ArtisanInfoEntity } from '../../entity/artisanInfo';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ArtisanInfoEntity,
  pageQueryOp: {
    fieldEq: ['id', 'userId', 'status', 'platformLevel'],
    keyWordLikeFields: ['gameCharacterName', 'serverName', 'introduction'],
  }
})
export class AdminArtisanInfoController extends BaseController {
 
}

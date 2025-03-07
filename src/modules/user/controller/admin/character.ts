import { CoolController, BaseController } from '@cool-midway/core';
import { UserCharacterEntity } from '../../entity/character';

/**
 * 描述
 */
@CoolController({
  api: ['list', 'page', 'info', 'add', 'update', 'delete'],
  entity: UserCharacterEntity,
})
export class AdminUserCharacterController extends BaseController {

}

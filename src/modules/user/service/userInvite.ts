import { Init, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserInviteEntity } from '../entity/invite';

/**
 * 描述
 */
@Provide()
export class UserInviteService extends BaseService {
  @InjectEntityModel(UserInviteEntity)
  userInviteEntity: Repository<UserInviteEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.userInviteEntity);
  }

}

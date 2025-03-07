import { Init, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserCharacterEntity } from '../entity/character';

/**
 * 描述
 */
@Provide()
export class UserCharacterService extends BaseService {
  @InjectEntityModel(UserCharacterEntity)
  userCharacterEntity: Repository<UserCharacterEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.userCharacterEntity);
  }

  /**
   * 获取用户角色列表
   */
  async userList(userId: number) {
    return await this.userCharacterEntity.find({ where: { userId } });
  }

  /**
   * 添加用户角色
   */
  async addCharacter(character: { userId: number; className: string; specName: string; serverName: string; characterName: string; simcStr: string }) {
    if (!character.userId) throw new Error('userId不能为空');
    const existingCharacter = await this.userCharacterEntity.findOne({ where: { userId: character.userId, className: character.className, specName: character.specName } });
    if (existingCharacter) {
      await this.userCharacterEntity.update(existingCharacter.id, character);
    } else {
      await this.userCharacterEntity.save(character);
    }
  }
}

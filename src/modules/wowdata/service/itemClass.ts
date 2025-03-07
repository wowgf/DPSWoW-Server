import { Init, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { WowdataItemClassEntity } from '../entity/itemClass';

/**
 * 描述
 */
@Provide()
export class ItemClassService extends BaseService {
  @InjectEntityModel(WowdataItemClassEntity)
  itemClassEntity: Repository<WowdataItemClassEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.itemClassEntity);
  }

  /**
   * 导入数据
   */
  async importData(data) {
    for (const item of data) {
      const entity = new WowdataItemClassEntity();
      entity.classId = item.id;
      entity.name = item.name;
      await this.itemClassEntity.save(entity);
    }
  }

}

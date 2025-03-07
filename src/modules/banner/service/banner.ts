import { Init, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BannerEntity } from '../entity/banner';
import { BannerQueryDTO } from '../dto/banner';

/**
 * 描述
 */
@Provide()
export class BannerService extends BaseService {
  @InjectEntityModel(BannerEntity)
  bannerEntity: Repository<BannerEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.bannerEntity);
  }

  /**
   * 描述
   */
  async list(query?: BannerQueryDTO) {
    let where: any = { position: 1 }
    if (query?.position) {
      where.position = query.position
    }

    if (query?.isAllPosition == 1) {
      delete where.position
    }

    return await this.bannerEntity.find({
      where: {
        ...where,
        status: 1,
      },
      select: ['cover', 'link', 'title', 'sort', 'id', 'position'],
      order: {
        sort: 'asc',
      },
    });
  }
}

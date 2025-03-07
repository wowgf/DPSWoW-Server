import { Provide } from '@midwayjs/decorator';
import { BaseService, CoolCache } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Between, Equal } from 'typeorm';
import { DpsTopRankEntity } from '../entity/dpsTopRank.entity';
import { UserSimcRecordEntity } from '../../simc/entity/userSimcRecord';

@Provide()
export class DpsTopRankService extends BaseService {

  @InjectEntityModel(DpsTopRankEntity)
  topRankEntity: Repository<DpsTopRankEntity>;

  @InjectEntityModel(UserSimcRecordEntity)
  userSimcRecordEntity: Repository<UserSimcRecordEntity>;

  /**
   * 获取总排行榜
   */
  // @CoolCache(1000 * 60) // 缓存1分钟
  async getTopRank(query: {
    className?: string;
    rankType?: number;
    spec?: string;
    serverName?: string;
    page?: number;
    size?: number;
  }) {
    // Set default values
    query.page = query.page || 1;
    query.size = query.size || 100;

    if (query.size * query.page > 1000) {
      throw new Error('仅支持查询前1000条数据');
    }

    const queryBuilder = this.topRankEntity
      .createQueryBuilder('rank')
      .orderBy('rank.dps', 'DESC');

    if (query.rankType) {
      queryBuilder.andWhere('rank.rankType = :rankType', { rankType: query.rankType });
    }

    if (query.className) {
      queryBuilder.andWhere('rank.className = :className', { className: query.className });
    }
    if (query.spec) {
      queryBuilder.andWhere('rank.spec = :spec', { spec: query.spec });
    }

    if (query.serverName) {
      queryBuilder.andWhere('rank.serverName = :serverName', { serverName: query.serverName });
    }

    let total = await queryBuilder.getCount();
    total > 1000 && (total = 1000);

    const list = await queryBuilder
      .skip((query.page - 1) * query.size)
      .take(query.size)
      .getMany();

    return {
      list: list.map((item, index) => ({
        ...item,
        rank: (query.page - 1) * query.size + index + 1
      })),
      pagination: {
        total,
        page: query.page,
        size: query.size
      }
    };
  }

  /**
   * 获取个人排行
   * @param userId
   * @param rankType 1: 单体 2: 多目标
   */
  // @CoolCache(1000 * 60) // 缓存1分钟
  async getPersonalRank(userId: number) {
    const ranks = await this.topRankEntity.find({
      where: { userId },
      order: { dps: 'DESC' }
    });

    return Promise.all(ranks.map(async rank => {
      const totalRank = await this.getTotalRank(rank);
      const classRank = await this.getClassRankPosition(rank);
      const specRank = await this.getSpecRankPosition(rank);
      const serverRank = await this.getServerRankPosition(rank)

      return {
        ...rank,
        totalRank,
        classRank,
        specRank,
        serverRank
      };
    }));
  }

  async getPersonalTotalRank(userId: number) {
    const ranks = await this.topRankEntity.find({
      where: { userId },
      order: { dps: 'DESC' }
    });

    return Promise.all(ranks.map(async rank => {
      const totalRank = await this.getTotalRank(rank);

      return {
        ...rank,
        totalRank,
      };
    }));
  }

  /**
   * 获取职业排行榜(前100)
   */
  // @CoolCache(1000 * 60 * 1) // 缓存5分钟
  async getClassRank(className: string) {
    return await this.topRankEntity.find({
      where: { className },
      order: { dps: 'DESC' },
      take: 100
    });
  }

  /**
   * 获取专精排行榜（前100）
   */
  // @CoolCache(1000 * 60 * 1) // 缓存5分钟
  async getSpecRank(spec: string) {
    return await this.topRankEntity.find({
      where: { spec },
      order: { dps: 'DESC' },
      take: 100
    });
  }

  /**
   * 获取服务器排行
   */
  // @CoolCache(1000 * 60 * 1) // 缓存1分钟
  async getServerRank(serverName: string) {
    return await this.topRankEntity.find({
      where: { serverName },
      order: { dps: 'DESC' },
      take: 100
    });
  }

  /**
   * 获取装等范围排行
   */
  // @CoolCache(1000 * 60 * 1) // 缓存1分钟
  async getItemLevelRank(minItemLevel: number, maxItemLevel: number) {
    return await this.topRankEntity.find({
      where: {
        itemLevel: Between(minItemLevel, maxItemLevel)
      },
      order: { dps: 'DESC' },
      take: 100
    });
  }

  /**
   * 更新排行记录
   * 不加缓存，因为是写操作
   */
  async saveOrUpdateTopRank(recordId: string) {
    const record = await this.userSimcRecordEntity.findOneBy({ id: Equal(recordId) });
    if (!record) {
      throw new Error('记录不存在');
    }

    const isDefaulStr = record.params?.isDefaultStr;
    if (isDefaulStr === 1) { // 默认字符串不计入排行榜
      return false;
    }

    // 获取排行榜类型（单体/多目标）
    const rankType = this.getRankType(record);
    if (rankType !== 1 && rankType !== 2) {
      throw new Error('不是标准单体或多目标参数');
    }

    // 查找现有排行记录（需同时匹配角色名和排行类型）
    const existingRank = await this.topRankEntity.findOne({
      where: {
        userId: record.userId,
        characterName: record.playerInfo.playerName,
        rankType: rankType // 增加rankType条件
      }
    });

    // 如果不存在记录，或者新的DPS更高，则更新
    if (!existingRank || existingRank.dps < record.bestDps) {
      const topRank = existingRank || new DpsTopRankEntity();

      topRank.rankType = rankType;
      topRank.dps = record.bestDps;
      topRank.characterName = record.playerInfo.playerName;
      topRank.serverName = record.playerInfo.server;
      topRank.className = record.playerInfo.metier;
      topRank.spec = record.playerInfo.spec;
      topRank.itemLevel = record.itemLevel;
      topRank.userId = record.userId;
      topRank.simcRecordId = record.id;

      await topRank.save();
      return true;
    }

    return false;
  }

  /**
   * 获取排行榜类型
   * 根据record记录中
   * fight_style = 'Patchwerk' and desired_targets = 1 and max_time = 360
   * 
   */
  getRankType(record: Partial<UserSimcRecordEntity>) {
    if (record.simcConfig.fight_style === 'Patchwerk' && record.simcConfig.desired_targets === 1 && record.simcConfig.max_time === 360) {
      return 1; // 单体
    } else if (record.simcConfig.fight_style === 'Patchwerk' && record.simcConfig.desired_targets === 5 && record.simcConfig.max_time === 40) {
      return 2; // AOE
    }
  }

  /**
   * 获取总排行位置
   * @param rank
   */
  async getTotalRank(rank: DpsTopRankEntity) {
    const result = await this.topRankEntity
      .createQueryBuilder('rank')
      .where('rank.dps > :dps', { dps: rank.dps })
      .andWhere('rank.rankType = :rankType', { rankType: rank.rankType })
      .getCount();
    return result + 1;
  }

  /**
   * 获取职业排行位置
   * @param rank
   */
  async getClassRankPosition(rank: DpsTopRankEntity) {
    const result = await this.topRankEntity
      .createQueryBuilder('rank')
      .where('rank.className = :className', { className: rank.className })
      .andWhere('rank.dps > :dps', { dps: rank.dps })
      .andWhere('rank.rankType = :rankType', { rankType: rank.rankType })
      .getCount();
    return result + 1;
  }

  /**
   * 获取专精排行位置
   * @param rank
   */
  async getSpecRankPosition(rank: DpsTopRankEntity) {
    const result = await this.topRankEntity
      .createQueryBuilder('rank')
      .where('rank.spec = :spec', { spec: rank.spec })
      .andWhere('rank.dps > :dps', { dps: rank.dps })
      .andWhere('rank.rankType = :rankType', { rankType: rank.rankType })
      .getCount();
    return result + 1;
  }

  /**
   * 获取服务器排行位置
   * @param rank
   */
  async getServerRankPosition(rank: DpsTopRankEntity) {
    const result = await this.topRankEntity
      .createQueryBuilder('rank')
      .where('rank.serverName = :serverName', { serverName: rank.serverName })
      .andWhere('rank.dps > :dps', { dps: rank.dps })
      .andWhere('rank.rankType = :rankType', { rankType: rank.rankType })
      .getCount();
    return result + 1;
  }
}
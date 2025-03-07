import { Provide, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { DpsTopRankService } from '../../rank/service/dpsTopRank.service';
import { WowGroupEntity } from '../entity/wowGroup.entity';
import { WowGroupUserEntity } from '../entity/wowGroupUser.entity';
import { DpsTopRankEntity } from '../../rank/entity/dpsTopRank.entity';

@Provide()
export class GroupService {
  @InjectEntityModel(WowGroupEntity)
  groupEntity: Repository<WowGroupEntity>;

  @InjectEntityModel(WowGroupUserEntity)
  groupUserEntity: Repository<WowGroupUserEntity>;

  @InjectEntityModel(DpsTopRankEntity)
  dpsTopRankEntity: Repository<DpsTopRankEntity>;

  @Inject()
  dpsTopRankService: DpsTopRankService;

  /**
   * 绑定用户和群
   * @param groupId
   * @param userId
   */
  async bindUserToGroup(groupId: string, userId: number) {
    // 检查群是否存在，不存在则创建
    let group = await this.groupEntity.findOne({ where: { groupId } });
    if (!group) {
      group = new WowGroupEntity();
      group.groupId = groupId;
      await this.groupEntity.save(group);
    }

    // 检查用户是否已绑定
    const existing = await this.groupUserEntity.findOne({ where: { groupId, userId } });
    if (!existing) {
      const groupUser = new WowGroupUserEntity();
      groupUser.groupId = groupId;
      groupUser.userId = userId;
      await this.groupUserEntity.save(groupUser);
    }
  }

  /**
   * 获取群DPS排行榜
   * @param groupId
   */
  async getGroupDpsRank(groupId: string) {
    // 使用 JOIN 一次性查询
    const ranks = await this.dpsTopRankEntity
      .createQueryBuilder('rank')
      .select([
        'rank.id',
        'rank.userId',
        'rank.characterName',
        'rank.serverName',
        'rank.className',
        'rank.spec',
        'rank.dps',
        'rank.itemLevel',
        'rank.rankType',
        'rank.createTime',
        'rank.updateTime',
        'user.nickName',
        'user.avatarUrl'
      ])
      .innerJoin(WowGroupUserEntity, 'groupUser', 'rank.userId = groupUser.userId')
      .leftJoin('user_info', 'user', 'rank.userId = user.id')
      .where('groupUser.groupId = :groupId', { groupId })
      .orderBy('rank.dps', 'DESC')
      .getRawMany();

    // 格式化返回数据
    return ranks.map(item => ({
      id: item.rank_id,
      userId: item.rank_userId,
      characterName: item.rank_characterName,
      serverName: item.rank_serverName,
      className: item.rank_className,
      spec: item.rank_spec,
      dps: item.rank_dps,
      itemLevel: item.rank_itemLevel,
      rankType: item.rank_rankType,
      createTime: item.rank_createTime,
      updateTime: item.rank_updateTime,
      // 用户信息
      nickName: item.user_nickName,
      avatarUrl: item.user_avatarUrl,
    }));
  }

  /**
   * 用户是否绑定了群
   */
  async isUserBindGroup(userId: number, groupId: string) {
    const existing = await this.groupUserEntity.findOne({ where: { groupId, userId } });
    return !!existing;
  }

  /**
   * 获取我的群排行
   * 分两种情况，一种是用户未绑定群，一种是用户绑定了群
   * @param userId
   * @param groupId
   */
  async getMyGroupRank(userId: number, groupId: string) {
    // 检查用户是否已绑定
    const existing = await this.groupUserEntity.findOne({ where: { groupId, userId } });
    if (!existing) {
      return {
        ranks: null, type: 1 // 未绑定
      };
    }
    // 查询用户在群内的排名
    const ranks = await this.getGroupDpsRank(groupId);
    const myRanks = ranks.filter(rank => rank.userId === userId);
    if (myRanks.length === 0) {
      return {
        ranks: null, type: 2 // 绑定但未上榜
      };
    }
    return {
      ranks: myRanks, type: 3 // 绑定且上榜
    };
  }

}
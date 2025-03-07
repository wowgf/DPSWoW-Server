import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { WowdataItemEnchantEntity } from '../entity/itemEnchant';
import axios from 'axios';
import * as promiseLimit from 'promise-limit';
import { PluginService } from '../../plugin/service/info';
/**
 * 描述
 */
@Provide()
export class ItemEnchantService extends BaseService {
  @InjectEntityModel(WowdataItemEnchantEntity)
  itemEnchantEntity: Repository<WowdataItemEnchantEntity>;

  @Inject()
  pluginService: PluginService;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.itemEnchantEntity);
  }

  /**
   * 获取列表
   */
  async getList() {
    return await this.itemEnchantEntity.find({ where: { status: 1 } });
  }

  /**
   * 导入数据
   */
  async importData(list: any[]) {

    const limit = promiseLimit(10); // 控制并发数为10

    const partMap = {
      2090: 'ring',
      2088: 'chest',
      2134: 'wrist',
      2135: 'back',
      2133: 'feet',
      2091: 'gem',
      2089: 'main_hand',
      210: 'legs',
    }

    try {
      // 查询数据库中是否存在
      let ids = list.map(item => item.itemId);
      let itemList = await WowdataItemEnchantEntity.find({ where: { itemId: In(ids) }, select: ['itemId'] })
      let existIds = itemList.map(item => item.itemId);
      let promises: Promise<any>[] = list.filter(v => !existIds.includes(v.itemId) && v.itemId).map((item: any) => limit(async () => {
        let data = await this.getWowItemData(item.itemId, { 'crafting-quality': item.craftingQuality });
        return {
          wowId: item.id,
          itemId: item.itemId,
          spellId: item.spellId,
          name: data.name,
          displayName: item.displayName,
          expansion: item.expansion,
          stats: item.stats || null,
          spellEffects: item.spellEffects || null,
          equipRequirements: item.equipRequirements || null,
          slot: item.slot,
          socketType: item.socketType,
          icon: item.icon,
          iconUrl: data.icon_url,
          spellIcon: item.spellIcon,
          quality: item.quality,
          craftingQuality: item.craftingQuality,
          description: item.description || '',
          status: 1,
          tooltip: data.tooltip || '',
          part: item.categoryId ? partMap[item.categoryId] : '',
        };
      }));
      let dataList = await Promise.all(promises);
      // 插入数据
      await this.itemEnchantEntity.save(dataList);
      return dataList

    } catch (error) {
      console.log(error);

      throw new CoolCommException('数据格式错误');
    }

  }

  /**
   * 查询数据
   * @param id 物品id
   */
  async getWowItemData(id: any, params?: { 'crafting-quality': number }) {
    let res = await axios.get(`https://db.newbeebox.com/wow/tooltip2/item/${id}?dataEnv=1&locale=4`, { params: params || {} });
    const iconUrl = await this.pluginService.invoke('upload', 'downAndUpload', res.data?.icon_url) || res.data?.icon_url
    res.data.icon_url = iconUrl;
    return res.data
  }

  /**
   * 查询数据
   * @param id 物品id
   */
  async getWowItemDataFromBz(id: any, params?: { 'crafting-quality': number }) {
    let res = await axios.get(`https://us.api.blizzard.com/data/wow/item/${id}?namespace=static-us&locale=zh_CN`, { params: params || {}, headers: { Authorization: 'Bearer KRFqf17VEKBxMSoIa3ZxOlGaMVLNNu7fMQ' } });
    return res.data
  }
}

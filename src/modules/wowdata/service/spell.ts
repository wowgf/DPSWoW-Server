import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { In, } from 'typeorm';
import axios from 'axios';
import * as promiseLimit from 'promise-limit';
import { WowSpellEntity } from '../entity/spell';
import { PluginService } from '../../plugin/service/info';
import { ILogger } from '@midwayjs/core';

export interface SpellData {
  id: any;
}

/**
 * 描述
 */
@Provide()
export class WowDataSpellService extends BaseService {
  @Inject()
  pluginService: PluginService;

  @Inject()
  logger: ILogger
  /**
   * 格式化装备数据
   * @param ids  
   * @returns 
   */
  async formatSpell(ids: any[]) {
    const limit = promiseLimit(10); // 控制并发数为10

    try {

      // 查询数据库中是否存在
      let itemList = await WowSpellEntity.find({ where: { spellId: In(ids) }, select: ['spellId', 'icon_url', 'name',] })

      let promises: Promise<any>[] = ids.map((id: any) => limit(async () => {
        let data = itemList.find(v => v.spellId == id) || await this.getWowSpellData(id);
        return { ...data };
      }));

      return await Promise.all(promises);

    } catch (error) {
      throw new CoolCommException('数据格式错误');
    }

  }

  /**
   * 获取技能数据
   * @param id 
   * @returns 
   */
  async getWowSpellData(id: any) {
    let res = await axios.get(`https://db.newbeebox.com/wow/tooltip2/spell/${id}?dataEnv=1&locale=4`)
    if (res.data && id && res.data.name !== '解析失败' && !res.data.error) {
      try {
        let iconUrl = await this.pluginService.invoke('upload', 'downAndUpload', res.data?.icon_url) || res.data?.icon_url
        WowSpellEntity.insert({
          spellId: id,
          icon_url: iconUrl,
          quality: res.data.quality,
          spells: res.data.spells,
          name: res.data.name,
          buff: res.data.buff,
          // tooltip: res.data.tooltip,
        }).catch((e) => {
          this.logger.error('Error inserting item data', e);
        })
      } catch (error) {
        this.logger.error('Error inserting item data', id, res.data);
        this.logger.error('Error inserting item message', error);
      }
      return { ...res.data, spellId: id };
    }
    return null

  }
}

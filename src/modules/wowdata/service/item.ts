import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { In } from 'typeorm';
import axios from 'axios';
import { WowdataItemEntity } from '../entity/item';
import * as promiseLimit from 'promise-limit';
import { PluginService } from '../../plugin/service/info';
import * as fs from 'fs';
import * as path from 'path';

export interface Gear {
  head: GearData[],
  neck: GearData[],
  shoulder: GearData[],
  back: GearData[],
  chest: GearData[],
  wrist: GearData[],
  hands: GearData[],
  waist: GearData[],
  legs: GearData[],
  feet: GearData[],
  main_hand: GearData[],
  off_hand: GearData[],
  rings: GearData[],
  trinkets: GearData[],

  [property: string]: GearData[];
}


export interface GearData {
  id: any;
  [property: string]: any[];
}

/**
 * 描述
 */
@Provide()
export class WowDataItemService extends BaseService {
  @Inject()
  pluginService: PluginService;
  /**
   * 格式化装备数据
   * @param gearData 
   * @returns 
   */
  async formatGear(gearData: Gear) {
    const limit = promiseLimit(10); // 控制并发数为10
    let keys = Object.keys(gearData);
    let ids = []

    try {
      keys.map(key => {
        ids = ids.concat(gearData[key].map(item => Number(item.id)))
      })

      // 查询数据库中是否存在
      let itemList = await WowdataItemEntity.find({ where: { itemId: In(ids) } })

      for (const key in gearData) {
        let arr = gearData[key];
        let promises: Promise<any>[] = arr.map((item: any) => limit(async () => {
          let data = itemList.find(v => v.itemId == item.id) || await this.getWowItemData(item.id, { level: item.gearLevel || undefined });
          return { ...item, ...data };
        }));

        gearData[key] = await Promise.all(promises);
      }

      return gearData

    } catch (error) {
      console.log(error);

      throw new CoolCommException('数据格式错误');
    }

  }
  /**
   * 格式化天赋数据
   * @param ids 
   * @returns 
   */
  async formatSpell(ids: any[]) {
    let arr = [];
    for (let i = 0; i < ids.length; i++) {
      let item = ids[i];
      let data = await this.getWowSpellData(item.id);
      arr.push({ ...item, ...data });
    }
    return arr;
  }

  /**
   * 查询数据
   * @param id 物品id
   */
  async getWowItemData(id: any, params?: { level?: any; bonus?: any }) {
    let res = await axios.get(`https://db.newbeebox.com/wow/tooltip2/item/${id}?dataEnv=1&locale=4`, { params: params || {} });
    WowdataItemEntity.findOne({ where: { itemId: id } }).then(async data => {
      if (!data) {
        let iconUrl = await this.pluginService.invoke('upload', 'downAndUpload', res.data?.icon_url) || res.data?.icon_url
        let level = undefined;
        const itemLevelRegex = /物品等级：<!--ilvl-->(\d+)/;
        const match = res.data.tooltip.match(itemLevelRegex);        
        if(match) {
          level = match[1];
        }
        WowdataItemEntity.insert({
          itemId: id,
          iconUrl: iconUrl,
          quality: res.data.quality,
          spells: res.data.spells,
          name: res.data.name,
          level: level,
        }).catch(() => {
          console.error('Error inserting item data');
        })
      }
    })

    return { ...res.data, itemId: id };
  }

  async getWowSpellData(id: any) {
    let res = await axios.get(`https://db.newbeebox.com/wow/tooltip2/spell/${id}?dataEnv=1&locale=4`)
    return res.data
  }

  // 同步物品图片
  async syncItemImgFromRot(itemList: any[]) {
    const cos = await this.pluginService.getInstance('upload');
    const download = require('download')
    for (let index = 0; index < itemList.length; index++) {
      try {
        const item = itemList[index];
        const iconName = item.icon
        const data = await download(`https://www.raidbots.com/static/images/icons/36/${iconName}.png`);

        const ossKey = `/wow/images/items/${iconName}.png`;
        const itemIdKey = `/wow/images/items/${item.id}.png`;

        const tempDir = './temp';
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
        }
        const tempFilePath = path.join(tempDir, `${iconName}.png`);
        fs.writeFileSync(tempFilePath, data);

        await cos.uploadWithKey(tempFilePath, ossKey);
        await cos.uploadWithKey(tempFilePath, itemIdKey);

        // 上传后删除临时文件（可选）
        fs.unlinkSync(tempFilePath);
        console.log(`[${index + 1}/${itemList.length}] upload ${iconName} success`);
      } catch (error) {
        console.log(error);
      }
    }
    console.log('同步完成');
  }

  // 同步物品图片
  async syncBossImgFromRot(instanceList: { encounters: { icon: string }[] }[]) {
    const cos = await this.pluginService.getInstance('upload');
    const download = require('download')
    for (let i = 0; i < instanceList.length; i++) {
      try {
        const instance = instanceList[i];
        for (let j = 0; j < instance.encounters.length; j++) {
          const encounter = instance.encounters[j];
          const iconName = encounter.icon

          if (iconName) {
            const data = await download(`https://www.raidbots.com/static/images/EncounterJournal/orig/${iconName}.png`);

            const ossKey = `/wow/images/EncounterJournal/orig/${iconName}.png`;

            const tempDir = './temp';
            if (!fs.existsSync(tempDir)) {
              fs.mkdirSync(tempDir);
            }
            const tempFilePath = path.join(tempDir, `${iconName}.png`);
            fs.writeFileSync(tempFilePath, data);

            await cos.uploadWithKey(tempFilePath, ossKey);

            // 上传后删除临时文件（可选）
            fs.unlinkSync(tempFilePath);
            console.log(` upload ${iconName} success`);
          }

        }

      } catch (error) {
        console.log(error);
      }
    }
    console.log('同步完成');
  }

  /**
   * 同步食物图片
   * @param foodList 
   */
  async syncFoodImgFromRot(foodList: { icon: string }[]) {
    const cos = await this.pluginService.getInstance('upload');
    const download = require('download')
    for (let index = 0; index < foodList.length; index++) {
      try {
        const item = foodList[index];
        const iconName = item.icon
        const data = await download(`https://cdn2.newbeebox.com/wow_zamimg/images/wow/icons/large/${iconName}.jpg`);

        const ossKey = `/wow/images/icons/${iconName}.png`;
        const ossKey2 = `/wow/images/items/${iconName}.jpg`;

        const tempDir = './temp';
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
        }
        const tempFilePath = path.join(tempDir, `${iconName}.png`);
        fs.writeFileSync(tempFilePath, data);

        await cos.uploadWithKey(tempFilePath, ossKey);
        await cos.uploadWithKey(tempFilePath, ossKey2);
        // await cos.uploadWithKey(tempFilePath, itemIdKey);

        // 上传后删除临时文件（可选）
        fs.unlinkSync(tempFilePath);
        console.log(`[${index + 1}/${foodList.length}] upload ${iconName} success`);
      } catch (error) {
        console.log(error);
      }
    }
    console.log('同步完成');
  }

  /**
   * 同步食物图片
   * @param foodList 
   */
  async syncTalentImgFromRot(talentList: { classNodes: { entries: { icon: string }[] }[], specNodes: { entries: { icon: string }[] }[]; heroNodes: { entries: { icon: string }[] }[]; subTreeNodes: { entries: { icon: string }[] }[] }[]) {
    const cos = await this.pluginService.getInstance('upload');
    const download = require('download')
    let iconList: string[] = []
    let errorList: any[] = []
    const tempDir = './temp';
    for (let i = 0; i < talentList.length; i++) {
      const classNodes = talentList[i].classNodes;
      const specNodes = talentList[i].specNodes;
      const heroNodes = talentList[i].heroNodes;

      for (let j = 0; j < classNodes.length; j++) {
        const entries = classNodes[j].entries;
        for (let k = 0; k < entries.length; k++) {
          iconList.push(entries[k].icon)
        }
      }

      for (let j = 0; j < specNodes.length; j++) {
        const entries = specNodes[j].entries;
        for (let k = 0; k < entries.length; k++) {
          iconList.push(entries[k].icon)
        }
      }

      for (let j = 0; j < heroNodes.length; j++) {
        const entries = heroNodes[j].entries;
        for (let k = 0; k < entries.length; k++) {
          iconList.push(entries[k].icon)
        }
      }
    }
    iconList = Array.from(new Set(iconList));
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    fs.writeFileSync(path.join(tempDir, `iconList.json`), JSON.stringify(iconList));
    for (let index = 0; index < iconList.length; index++) {
      try {
        const item = iconList[index];
        const iconName = item
        const data = await download(`https://www.raidbots.com/static/images/icons/56/${iconName}.png`);

        const ossKey = `/wow/images/icons/${iconName}.png`;
        const ossKey2 = `/wow/images/icons/${iconName}.jpg`;



        const tempFilePath = path.join(tempDir, `${iconName}.jpg`);
        fs.writeFileSync(tempFilePath, data);

        await cos.uploadWithKey(tempFilePath, ossKey);
        await cos.uploadWithKey(tempFilePath, ossKey2);

        // 上传后删除临时文件（可选）
        // fs.unlinkSync(tempFilePath);
        console.log(`[${index + 1}/${iconList.length}] upload ${iconName} success`);
      } catch (error) {
        console.log(error);
        errorList.push(iconList[index])
      }
    }
    console.log('同步完成');
    console.log('失败列表', errorList);
    fs.writeFileSync(path.join(tempDir, `errorList.json`), JSON.stringify(errorList));

  }
}

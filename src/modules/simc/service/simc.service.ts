import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { UserSimcRecordEntity } from '../entity/userSimcRecord';
import { Repository } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { UserPointsService } from '../../point/service/userPoint.service';
import { SimulationOptions } from '../../../../typings/simc';
import { randomUUID } from 'crypto';
import * as bull from '@midwayjs/bull';
import { promisify } from 'util';
import { PluginService } from '../../plugin/service/info';
import { RedisService } from '@midwayjs/redis';
import { SimcResult } from '../types/result';
import { DpsTopRankService } from '../../rank/service/dpsTopRank.service';

/**
 * 描述
 */
@Provide()
export class SimcService extends BaseService {

  @InjectEntityModel(UserSimcRecordEntity)
  userSimcRecordEntity: Repository<UserSimcRecordEntity>;

  @Inject()
  userPointService: UserPointsService;

  @Inject()
  pluginService: PluginService;

  @Inject()
  topRankService: DpsTopRankService;

  @Inject()
  ctx: Context;

  @Inject()
  bullFramework: bull.Framework;

  @Inject()
  redis: RedisService;

  ONE_COMBO_POINTS = 0; // 一种组合1000次迭代是100积分
  DEFAULT_ITERATIONS = 1000; // 默认迭代次数
  DEFAULT_THREADS = 4; // 默认核心运行数

  // simc执行文件目录
  private readonly SIMC_FILE_PATH = path.join(process.cwd(), 'bin');
  // 用户report文件目录
  private readonly REPORT_FILE_PATH = path.join(process.cwd(), 'output', 'report');
  // Redis锁的key前缀
  private readonly SIMC_TASK_LOCK = 'simc:task:lock:';
  // 锁的过期时间(秒)
  private readonly LOCK_EXPIRE = 600; // 10分钟

  /**
   * @Date 12.03 新增上传json到oss
   * 运行 simc脚本并拿到输出结果
   * 1. 运行 simc 脚本
   * 2. 运行后拿到output里的json数据
   * 3. 返回json数据
   * @param simcStr - simc脚本字符串
   * @param type - 类型 1-最佳装备 2-快速模拟 3-属性权重
   * @param params - 参数
   */
  async runSimcScriptAndGetData(simcStr: string, combinations: any[], playerInfo: any, simcConfig: any, type: number, params: any, itemLevel: number, simcSourceStr: string): Promise<any> {
    const userId = this.ctx?.user?.id;
    const comboNum = combinations?.length || 0; // 组合数量
    const points = this.ONE_COMBO_POINTS * comboNum;

    // 用户积分校验
    if (points > 0) await this.userPointService.checkPoints(userId, points);

    // 检查是否可以执行新任务
    const canRun = await this.checkAndSetTaskLock(userId);
    if (!canRun) {
      throw new CoolCommException('您有正在进行的任务,请等待完成后再试');
    }
    // 获取 Processor 相关的队列
    const simcQueue = this.bullFramework.getQueue('simc');

    // 配置日志输出等参数
    simcStr = this.addParams(simcStr);
    // console.log('simcStr:', simcStr);
    // 格式化用户输入的simc字符串
    simcStr = this.replaceSimcStr(simcStr);
    // console.log('simcStr:', simcStr);
    // 目前只允许运行1000次迭代
    let iterations = 1000;
    const costPoint = this.ONE_COMBO_POINTS * comboNum * (iterations / this.DEFAULT_ITERATIONS)

    /************* 上传一些数据到cos  *************/

    // 上传原始字符串到cos
    const originSimcStrUrl = await this.putStrToCos(simcSourceStr, 'Simc/origin-str');
    // 上传最终字符串到cos
    const rawSimcStrUrl = await this.putStrToCos(simcStr, 'Simc/raw-str');
    // 上传组合数据到cos
    const combinationsUrl = await this.putStrToCos(JSON.stringify(combinations), 'Simc/combinations', 'json');

    // 记录用户simc记录
    const simcRecord = await this.userSimcRecordEntity.save({ userId, cost: costPoint, playerInfo: playerInfo || {}, simcConfig, type: type, params, itemLevel, originSimcStrUrl, rawSimcStrUrl, combinationsUrl });
    // 生成uuid jobId
    const jobId = randomUUID();
    const job = await simcQueue.runJob({ userId, simcStr, combinations, playerInfo, simcRecordId: simcRecord.id, type }, { jobId });
    // 发送到队列
    // const job = await this.simcQueue.add({ userId, simcStr, combinations, playerInfo, simcRecordId: simcRecord.id }, { jobId });
    // 更新jobId
    await this.userSimcRecordEntity.update(simcRecord.id, { jobId: job.id });

    return simcRecord.id;
  }

  /**
   * 执行程序
   * 处于队列中的任务
   * @param data 
   */
  async processQueue(data: { userId: number, simcStr: string, combinations: any[], playerInfo?: any, simcRecordId: string, type: number }) {
    // console.log('processQueue:', data.userId);

    const { userId, simcStr, combinations, simcRecordId, type: simcType } = data;
    const comboNum = combinations.length || 0;

    const filePath = this.SIMC_FILE_PATH;
    // console.log('filePath:', filePath);

    // simc执行命令
    const simcCommand = `${filePath}/simc ${simcStr}`;
    // json报告生成的本地路径
    const reportJsonPath = path.join(this.REPORT_FILE_PATH, `report_${userId}.json`);
    // html报告生成的本地路径
    const reportHtmlPath = path.join(this.REPORT_FILE_PATH, `report_${userId}.html`);

    // 执行 simc 命令
    try {
      // 更新id的一条运行中状态
      await this.userSimcRecordEntity.update(simcRecordId, { status: 2 });

      // 将 exec 方法转换为 Promise
      const execPromise = promisify(exec);
      // 执行 simc 命令
      await execPromise(simcCommand);

      /********  读取report.json文件内容  *********/
      console.log('读取report.json文件内容');
      const jsonData: SimcResult = await this.readJsonFileWithRetry(reportJsonPath, 200, 3);
      console.log('读取成功');
      const players = this.handleJsonPlayersData(jsonData.sim.players);
      const saveData = {
        players,
        statistics: jsonData.sim.statistics,
        profilesets: jsonData.sim.profilesets,
      };
      // json存储到cos
      // const ossPath = await this.pluginService.putObject('simc', `report_${userId}.json`, JSON.stringify(jsonData));
      const cos = await this.pluginService.getInstance('upload');
      const ossKey = `Simc/report/report_${simcRecordId}.json`;
      const cosUrl = await cos.uploadWithKey(reportJsonPath, ossKey);
      // html存储到cos
      const ossKeyHtml = `Simc/report/report_${simcRecordId}.html`;
      const cosUrlHtml = await cos.uploadWithKey(reportHtmlPath, ossKeyHtml);

      // 获取应扣除的积分,TODO计算得出 costPoint = 100 * comboNum * (iterations / 1000)
      const iterations = 1000;
      const costPoint = this.ONE_COMBO_POINTS * comboNum * (iterations / this.DEFAULT_ITERATIONS);
      // 扣除用户积分
      if (costPoint > 0) await this.userPointService.consumePoints(userId, costPoint);
      
      // 最后，更新至完成状态
      await this.userSimcRecordEntity.update(simcRecordId, {
        status: 3, rawResultUrl: cosUrl, htmlReportUrl: cosUrlHtml,
        bestDps: this.calculateBestDps(saveData)
      });

      /************* 如果type=6则自动上传到排行榜 *************/
      if (simcType === 6) {
        // 上传到排行榜
        await this.topRankService.saveOrUpdateTopRank(simcRecordId);
      }

    } catch (error) {
      // 更新id的一条失败状态
      await this.userSimcRecordEntity.update(simcRecordId, { status: 9 });
      // 出错时释放任务锁
      await this.releaseTaskLock(userId);

      console.error(`执行错误: ${error.message}`);
      if (error.message.includes('Error: Unexpected parameter')) {
        throw new CoolCommException('字符串参数不正确');
      }
      console.error(`执行错误: ${error.message}`);
      this.ctx.logger.error(`执行错误: ${error.message}`);

    } finally {
      // 完成时释放任务锁
      await this.releaseTaskLock(userId);
    }
  }

  /**
   * 获取用户在队列中的位置
   */
  // async getUserQueuePosition(userId: number): Promise<number> {
  //   const queue = this.simcQueue.
  //   const index = queue.findIndex(item => item.userId === userId);
  //   return index + 1;
  // }

  /**
   * 处理用户输入的simc字符串
   * 1. 去掉 # 开头 \n结尾的注释
   * 2. 换行符替换为空格
   */
  private replaceSimcStr(simcStr: string): string {
    return simcStr.replace(/#.*\n/g, '').replace(/\n/g, ' ');
  }

  /**
   * 添加其他参数
   * iterations、 html、json2
   * log=1 html=./src/modules/simc/output/report.html json2=./src/modules/simc/output/report.json
   */
  private addParams(simcStr: string, params?: any): string {
    const iterations = params?.iterations || this.DEFAULT_ITERATIONS;
    // const iterations = 5000;
    const userId = this.ctx?.user?.id;
    // 没有则新建output文件夹 simcFilePath/output
    const outputDir = this.REPORT_FILE_PATH
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    // 换行避免被识别成注释
    simcStr += '\n';
    // 添加模拟次数
    simcStr = `${simcStr} iterations=${iterations}`;
    // 添加战斗时长
    // simcStr = `${simcStr} max_time=300`;
    // 添加战斗场景
    // simcStr = `${simcStr} fight_style=hectic_adds`;
    // 添加运行CPU核心数
    simcStr = `${simcStr} threads=${this.DEFAULT_THREADS}`;

    simcStr = `${simcStr} html=${outputDir}/report_${userId}.html`;
    simcStr = `${simcStr} json2=${outputDir}/report_${userId}.json`;
    return simcStr
  }

  /**
   * 处理返回的json数据中的players数组
   * players数组里的对象 只保留部分字段
   */
  handleJsonPlayersData(players: any): any {
    if (!players || players.length === 0) {
      return [];
    }

    const fieldsToKeep = [
      'name', 'race', 'level', 'role', 'specialization', 'profile_source', 'talents',
      'party', 'ready_type', 'bugs', 'valid_fight_style', 'scale_player', 'potion_used',
      'timeofday', 'zandalari_loa', 'vulpera_tricks', 'earthen_mineral', 'invert_scaling',
      'reaction_offset', 'reaction_max', 'reaction_mean', 'reaction_stddev', 'reaction_nu',
      'world_lag', 'world_lag_stddev', 'brain_lag', 'brain_lag_stddev',
    ];

    players = players.map((player: any) => {
      const filteredPlayer: any = {};
      fieldsToKeep.forEach(field => {
        if (player.hasOwnProperty(field)) {
          filteredPlayer[field] = player[field];
        }
      });
      return filteredPlayer;
    });

    return players;
  }

  private async readJsonFileWithRetry(filePath: string, delay: number, retries: number): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.sleep(delay);
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(data);
      } catch (err) {
        if (i === retries - 1) {
          throw new Error(`读取或解析文件错误: ${err.message}`);
        }
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  sleep2(ms: number) {
    console.log('sleep2');
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 生成装备数据
   * @param arr 
   * @param playerInfo 
   * @returns 
   */
  generalSimcStr(arr: any[], playerInfo: any, simcConfig?: SimulationOptions) {
    let simcStr = `# Base Actor`
    let name = playerInfo.playerName
    for (let key in playerInfo) {
      if (!['playerName', 'talentsList','metier'].includes(key)) {
        simcStr = simcStr + '\n' + `${key}=${playerInfo[key]}`
      }
    }

    arr.forEach((item, index) => {
      if (index == 1) {
        simcStr = simcStr + `\n# Actors`
      }
      let copyStr = index < 0 ? `copy="Combo ${index + 1},${name}"` : ''
      let startStr = index > 0 ? `profileset."Combo ${index + 1}"+=` : ''
      simcStr = simcStr + '\n' + copyStr + '\n' + this.generalComboSimc(item, index) + '\n' + `${startStr}`
    })
    if (simcConfig) {
      simcStr = simcStr + this.generalSimulationOptionsString(simcConfig)
    }

    // console.log('simcStr', simcStr);

    return simcStr
  }

  /**
   * 生成单个的ComboSimc字符
   * @param params 
   */
  generalComboSimc(params: any, comboIndex: number) {
    const OBJ_KEYS = ['id', 'bonus_id', 'enchant_id', 'gem_id']
    let simcStr = `### Combo ${comboIndex + 1}`
    let startStr = comboIndex > 0 ? `profileset."Combo ${comboIndex + 1}"+=` : ''
    for (let key in params) {
      let item = params[key]
      let line = `${startStr}${key}=`
      if (key == 'talents') {
        line = line + item
      } else {
        for (let objKey in item) {
          if (OBJ_KEYS.includes(objKey)) {
            if (objKey === 'id') {
              line += `,${objKey}=${item.itemId}`
            } else {
              line += `,${objKey}=${item[objKey]}`
            }
          }
        }
      }

      simcStr = simcStr + '\n' + line
    }
    return simcStr
  }

  /**
   * 
   * 生成配置字符串
   * Generates a string of general simulation options for a simulation.
   *
   * @param options - The simulation options.
   * @param options.fight_style - The style of the fight (战斗风格), default is 'Patchwerk'.
   * @param options.iterations - The number of iterations (迭代次数), default is 1000.
   * @param options.desired_targets - The number of desired targets (目标数量), default is 1.
   * @param options.max_time - The maximum time for the simulation (最大时间), default is 360.
   * @param options.calculate_scale_factors - Whether to calculate scale factors (计算缩放因子), default is 0.
   * @param options.scale_only - The attributes to scale (仅缩放属性), default is 'strength,intellect,agility,crit,mastery,vers,haste,weapon_dps,weapon_offhand_dps'.
   * @param options.bloodlust - Whether to override bloodlust (嗜血), default is 1.
   * @param options.arcane_intellect - Whether to override arcane intellect (奥术智慧), default is 1.
   * @param options.power_word_fortitude - Whether to override power word fortitude (真言术：韧), default is 1.
   * @param options.battle_shout - Whether to override battle shout (战斗怒吼), default is 1.
   * @param options.mystic_touch - Whether to override mystic touch (神秘之触), default is 1.
   * @param options.chaos_brand - Whether to override chaos brand (混沌烙印), default is 1.
   * @param options.skyfury - Whether to override skyfury (天空之怒), default is 1.
   * @param options.mark_of_the_wild - Whether to override mark of the wild (野性印记), default is 1.
   * @param options.hunters_mark - Whether to override hunter's mark (猎人印记), default is 1.
   * @param options.bleeding - Whether to override bleeding (流血), default is 1.
   * @param options.report_details - Whether to report details (报告详情), default is 1.
   * @param options.single_actor_batch - Whether to use single actor batch (单演员批处理), default is 1.
   * @param options.optimize_expressions - Whether to optimize expressions (优化表达式), default is 1.
   * @returns A string containing the general simulation options.
   */
  generalSimulationOptionsString(options: SimulationOptions) {
    let simcStr = `
# Simulation Options
fight_style=${options.fight_style || 'Patchwerk'}
iterations=${options.iterations || 1000}
desired_targets=${options.desired_targets || 1}
max_time=${options.max_time || 360}
`
    // 是否计算属性权重
    if (options.stat_weights == 1) {
      simcStr += `calculate_scale_factors=1 \n`
      simcStr += `scale_only=strength,intellect,agility,crit,mastery,vers,haste,weapon_dps,weapon_offhand_dps \n`
    }

    // 添加buffs
    if (options.buffs) {
      options.buffs.forEach(buff => {
        simcStr += `override.${buff.key}=${buff.value && 1 || 0}\n`
      })
    }
    // 添加消耗品
    if (options.consumables) {
      if (options.consumables.food) simcStr += `food=${options.consumables.food} \n`
      if (options.consumables.flask) simcStr += `flask=${options.consumables.flask} \n`
      if (options.consumables.potion) simcStr += `potion=${options.consumables.potion} \n`
      if (options.consumables.augmentation) simcStr += `augmentation=${options.consumables.augmentation} \n`
      if (options.consumables.weapon) simcStr += `temporary_enchant=${options.consumables.weapon} \n`
    }

    // calculate_scale_factors=${options.calculate_scale_factors || 0}
    // scale_only=strength,intellect,agility,crit,mastery,vers,haste,weapon_dps,weapon_offhand_dps
    // override.bloodlust=${options.bloodlust || 1}
    // override.arcane_intellect=${options.arcane_intellect || 1}
    // override.power_word_fortitude=${options.power_word_fortitude || 1}
    // override.battle_shout=${options.battle_shout || 1}
    // override.mystic_touch=${options.mystic_touch || 1}
    // override.chaos_brand=${options.chaos_brand || 1}
    // override.skyfury=${options.skyfury || 1}
    // override.mark_of_the_wild=${options.mark_of_the_wild || 1}
    // override.hunters_mark=${options.hunters_mark || 1}
    // override.bleeding=${options.bleeding || 1}
    // report_details=${options.report_details || 1}
    // single_actor_batch=${options.single_actor_batch || 1}
    // optimize_expressions=${options.optimize_expressions || 1}`
    return simcStr
  }

  /**
   * 计算最佳DPS
   */
  calculateBestDps({ statistics, profilesets }: recordSaveData) {
    // 输出结果
    const dpsResultList = [
      { ...statistics?.raid_dps, name: "Combo 1" }, // 当前装备的组合的dps
      ...(profilesets?.results || []), // 其他组合的dps
    ]

    // 按照dps进行排序
    const sortedDpsResultList = dpsResultList.sort((a, b) => b.mean - a.mean)

    return sortedDpsResultList[0].mean
  }

  /**
   * 检查并设置用户任务锁
   */
  private async checkAndSetTaskLock(userId: number): Promise<boolean> {
    const lockKey = `${this.SIMC_TASK_LOCK}${userId}`;

    // 使用setnx命令,如果key不存在则设置成功返回1,已存在则设置失败返回0
    const result = await this.redis.set(lockKey, '1', 'EX', this.LOCK_EXPIRE, 'NX');

    return result === 'OK';
  }

  /**
   * 释放用户任务锁 
   */
  private async releaseTaskLock(userId: number) {
    const lockKey = `${this.SIMC_TASK_LOCK}${userId}`;
    await this.redis.del(lockKey);
  }

  /**
   * 将字符串生成txt文件并上传至cos
   * 传入字符串,返回cos地址
   * @param str - 字符串
   * @param prefix - cos地址前缀
   * @param  - cos文件后缀
   * @param suffix - 文件后缀（默认为txt）
   * @returns cos地址
   */
  async putStrToCos(str: string, prefix = 'default', suffix = 'txt'): Promise<string> {
    if (!str) {
      return;
    }

    try {
      // 确保后缀不包含点号
      const cleanSuffix = suffix.startsWith('.') ? suffix.substring(1) : suffix;

      // 生成随机文件名
      const randomFileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // 创建临时文件路径
      const tempDir = path.join(os.tmpdir(), 'simc-temp');
      const tempFilePath = path.join(tempDir, `${randomFileName}.${cleanSuffix}`);

      // 确保临时目录存在
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // 写入临时文件
      await fs.promises.writeFile(tempFilePath, str, 'utf8');

      // 上传到cos
      const cos = await this.pluginService.getInstance('upload');
      const ossKey = `${prefix}/${randomFileName}.${cleanSuffix}`;
      const cosUrl = await cos.uploadWithKey(tempFilePath, ossKey);

      // 删除临时文件
      await fs.promises.unlink(tempFilePath);

      return cosUrl;
    } catch (error) {
      this.ctx.logger.error('上传文件失败:', error);
      throw new CoolCommException('上传文件失败');
    }
  }
}

interface recordSaveData {
  statistics: SimcResult['sim']['statistics'],
  profilesets: SimcResult['sim']['profilesets']
}
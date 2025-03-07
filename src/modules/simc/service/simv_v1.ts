import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { UserSimcRecordEntity } from '../entity/userSimcRecord';
import { Repository } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { UserPointsService } from '../../point/service/userPoint.service';
import { SimulationOptions } from '../../../../typings/simc';


/**
 * 描述
 */
@Provide()
export class SimcV1Service extends BaseService {

  @InjectEntityModel(UserSimcRecordEntity)
  userSimcRecordEntity: Repository<UserSimcRecordEntity>;

  @Inject()
  userPointService: UserPointsService;

  @Inject()
  ctx: Context;

  private queue: Array<{ simcStr: string, resolve: (value: any) => void, reject: (reason?: any) => void }> = [];
  private isProcessing = false;

  ONE_COMBO_POINTS = 100; // 一种组合1000次迭代是100积分
  DEFAULT_ITERATIONS = 1000; // 默认迭代次数

  simcFilePath = `${os.homedir}/project/SimulationCraft`;

  /**
   * 运行 simc脚本并拿到输出结果
   * 1. 运行 simc 脚本
   * 2. 运行后拿到output里的json数据
   * 3. 返回json数据
   * @param simcStr - simc脚本字符串
   * @param comboNum - 组合数量
   */
  async runSimcScriptAndGetData(simcStr: string, comboNum: number, combinations?: any[], playerInfo?: any): Promise<any> {
    const userId = this.ctx?.user?.id
    const points = this.ONE_COMBO_POINTS * comboNum;
    // 用户积分校验
    await this.userPointService.checkPoints(userId, points);

    // 添加日志输出等参数
    simcStr = this.addParams(simcStr, '1');
    // console.log('simcStr:', simcStr);
    // 格式化用户输入的simc字符串
    simcStr = this.replaceSimcStr(simcStr);
    // 记录用户simc记录
    await this.userSimcRecordEntity.save({ simcStr, userId, combinations: combinations || [], playerInfo: playerInfo || {} });
    return new Promise((resolve, reject) => {
      this.queue.push({ simcStr, resolve, reject });
      this.processQueue(userId, comboNum);
    });
  }

  private async processQueue(userId: number, comboNum: number) {
    if (this.isProcessing || this.queue.length === 0) {
      // 更新排队中状态
      await this.userSimcRecordEntity.update({ userId, status: 1 }, { status: 2 });
      return;
    }

    this.isProcessing = true;
    const { simcStr, resolve, reject } = this.queue.shift()!;

    try {
      const filePath = this.simcFilePath;
      const simcCommand = `${filePath}/simc ${simcStr}`;
      const reportJsonPath = `${filePath}/output/report_${userId}.json`;

      // 执行 simc 命令
      exec(simcCommand, async (error, stdout, stderr) => {
        if (error) {
          console.error(`执行错误: ${error.message}`);
          if (error.message.includes('Error: Unexpected parameter')) {
            this.isProcessing = false;
            this.processQueue(userId, comboNum);
            return reject(new Error('字符串参数不正确'));
          }
          console.error(`执行错误: ${error.message}`);
          this.isProcessing = false;
          this.processQueue(userId, comboNum);
          return reject(new Error('参数错误'));
        }
        if (stderr) {
          console.error(`标准错误: ${stderr}`);
          this.isProcessing = false;
          this.processQueue(userId, comboNum);
          return reject(new Error(stderr));
        }

        // 等待 stdout 输出完再读取文件
        if (stdout) {
          console.log(`标准输出: ${stdout}`);
        }

        // 读取 report.json 文件内容
        try {
          const jsonData = await this.readJsonFileWithRetry(reportJsonPath, 200, 3);
          const players = this.handleJsonPlayersData(jsonData.sim.players);
          const saveData = {
            players,
            statistics: jsonData.sim.statistics,
            profilesets: jsonData.sim.profilesets,
          }
          // 更新最新的一条运行完成状态
          this.userSimcRecordEntity.createQueryBuilder()
            .update(UserSimcRecordEntity)
            .set({ status: 3 })
            .where("userId = :userId", { userId })
            .orderBy("id", "DESC")
            .limit(1)
            .execute();

          // 获取应扣除的积分,TODO计算得出 costPoint = 100 * comboNum * (iterations / 1000)
          const iterations = 1000;
          const costPoint = this.ONE_COMBO_POINTS * comboNum * (iterations / this.DEFAULT_ITERATIONS)
          // 扣除用户积分
          this.userPointService.consumePoints(userId, costPoint);

          resolve(jsonData);
        } catch (err) {
          console.error(`读取或解析文件错误: ${err.message}`);
          reject(err);
        } finally {
          this.isProcessing = false;
          this.processQueue(userId, comboNum);
        }
      });
    } catch (error) {
      console.error(`错误: ${error.message}`);
      reject(error);
      this.isProcessing = false;
      this.processQueue(userId, comboNum);
    }
  }

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
  private addParams(simcStr: string, params: any): string {
    const iterations = params.iterations || this.DEFAULT_ITERATIONS;
    const userId = this.ctx?.user?.id;
    // 没有则新建output文件夹 simcFilePath/output
    const outputDir = `${this.simcFilePath}/output`;
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
      if (!['playerName'].includes(key)) simcStr = simcStr + '\n' + `${key}=${playerInfo[key]}`
    }

    arr.forEach((item, index) => {
      if (index == 1) {
        simcStr = simcStr + `\n# Actors`
      }
      let copyStr = index < 0 ? `copy="Combo ${index + 1},${name}"` : ''
      let startStr = index > 0 ? `profileset."Combo ${index + 1}"+=` : ''
      simcStr = simcStr + '\n' + copyStr + '\n' + this.generalComboSimc(item, index) + '\n' + `${startStr}talents=${playerInfo.talents}`
    })
    if (simcConfig) simcStr = simcStr + this.generalSimulationOptionsString(simcConfig)
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
      for (let objKey in item) {
        if (OBJ_KEYS.includes(objKey)) {
          line += `,${objKey}=${item[objKey]}`
        }
      }
      simcStr = simcStr + '\n' + line
    }
    return simcStr
  }

  /**
   * 生成配置字符串
   * @param options 
   * @returns 
   */
  generalSimulationOptionsString(options: SimulationOptions) {
    return `
  
  # Simulation Options
  fight_style=${options.fight_style || 'Patchwerk'}
  iterations=${options.iterations || 1000}
  desired_targets=${options.desired_targets || 1}
  max_time=${options.max_time || 360}
  calculate_scale_factors=${options.calculate_scale_factors || 0}
  scale_only=strength,intellect,agility,crit,mastery,vers,haste,weapon_dps,weapon_offhand_dps
  override.bloodlust=${options.bloodlust || 1}
  override.arcane_intellect=${options.arcane_intellect || 1}
  override.power_word_fortitude=${options.power_word_fortitude || 1}
  override.battle_shout=${options.battle_shout || 1}
  override.mystic_touch=${options.mystic_touch || 1}
  override.chaos_brand=${options.chaos_brand || 1}
  override.skyfury=${options.skyfury || 1}
  override.mark_of_the_wild=${options.mark_of_the_wild || 1}
  override.hunters_mark=${options.hunters_mark || 1}
  override.bleeding=${options.bleeding || 1}
  report_details=${options.report_details || 1}
  single_actor_batch=${options.single_actor_batch || 1}
  optimize_expressions=${options.optimize_expressions || 1}`
  }
}
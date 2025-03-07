import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { SimcService } from '../../service/simc.service';
import { SimulationOptions } from '../../../../../typings/simc';
import { SimcV1Service } from '../../service/simv_v1';
import { UserCharacterService } from '../../../user/service/character';
import { SaveOptions, RemoveOptions } from 'typeorm';
import { UserCharacterEntity } from '../../../user/entity/character';

/**
 * 描述
 */
@CoolController()
export class AppSimcController extends BaseController {

  @Inject()
  simcService: SimcService;

  @Inject()
  simcServiceV1: SimcV1Service;

  @Inject()
  userCharacterService: UserCharacterService;

  @Inject()
  ctx;

  @Post('/run', { summary: '运行simc并拿到输出结果' })
  async getSimcRunData(
    @Body('combinations') combinations: any[],
    @Body('playerInfo') playerInfo: { playerName: string, server: string, spec: string, metier: string },
    @Body('type') type: number,
    @Body('params') params: any,
    @Body('simcConfig') simcConfig: SimulationOptions,
    @Body('simcSourceStr') simcSourceStr: string, // 原始字符串
    @Body('simcFullStr') simcFullStr: string, // 最终simc字符串 
    @Body('itemLevel') itemLevel: number) {

    if (!combinations || !playerInfo || !simcConfig) {
      return this.fail('参数错误');
    }
    // 拼接 simc 字符串
    const simcStr = simcFullStr || this.simcService.generalSimcStr(combinations, playerInfo, simcConfig);
    if (!simcStr) {
      return this.fail('字符串不能为空');
    }
    if (simcStr.length > 100000) { // 100k
      return this.fail('字符串过长');
    }

    // 保存用户角色信息
    if (this.ctx.user.id && simcSourceStr) {
      this.userCharacterService.addCharacter({
        userId: this.ctx.user.id,
        characterName: playerInfo.playerName,
        className: playerInfo.metier,
        specName: playerInfo.spec,
        serverName: playerInfo.server,
        simcStr: simcSourceStr,
      })
    }

    const id = await this.simcService.runSimcScriptAndGetData(
      simcStr, combinations, playerInfo, simcConfig, type || 1, params, itemLevel, simcSourceStr);
    return this.ok({ id });
  }

  @Post('/run_old', { summary: '运行simc并拿到输出结果_v1' })
  async getSimcRunData_old(@Body('simcStr') simcStr: string) {
    if (!simcStr) {
      return this.fail('字符串不能为空');
    }
    const res = await this.simcServiceV1.runSimcScriptAndGetData(simcStr, 1);
    const players = this.simcService.handleJsonPlayersData(res.sim.players);
    return this.ok({
      // data: res,
      players,
      statistics: res.sim.statistics,
      profilesets: res.sim.profilesets,
    });
  }
}

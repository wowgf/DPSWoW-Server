import { CoolController, BaseController, CoolTag, TagTypes, CoolUrlTag } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { DpsTopRankService } from '../../service/dpsTopRank.service';

/**
 * 描述
 */
@CoolUrlTag()
@CoolController()
export class AppDpsTopRankController extends BaseController {

  @Inject()
  dpsTopRankService: DpsTopRankService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/topRank', { summary: '获取dps排行榜' })
  async getTopRank(
    @Body() query: {
      className?: string;
      rankType?: number;
      spec?: string;
      serverName?: string;
      page: number;
      size: number;
    }) {
    return this.ok(await this.dpsTopRankService.getTopRank(query));
  }

  @Post('/uploadDps', { summary: '上传成绩至排行榜' })
  async uploadDps(@Body('recordId') recordId: string) {
    if (!recordId) {
      return this.fail('参数错误');
    }
    return this.ok(await this.dpsTopRankService.saveOrUpdateTopRank(recordId));
  }

  @Post('/myRank')
  async getPersonalRank() {
    const userId = this.baseCtx.user.id
    return this.ok(await this.dpsTopRankService.getPersonalRank(userId));
  }

}

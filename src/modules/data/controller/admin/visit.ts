import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject } from '@midwayjs/core';
import { VisitDataService } from '../../service/visit';

/**
 * 描述
 */
@CoolController({
})
export class AdminTrackDataController extends BaseController {
  @Inject()
  visitDataService: VisitDataService
  @Get('/visit_today')
  async getVisitActiveToday() {
    let data = await this.visitDataService.getTodayVisitCount();
    return this.ok(data);
  }

  @Get('/visit_yesterday')
  async getVisitActiveYesterday() {
    let data = await this.visitDataService.getYestdayVisitCount();
    return this.ok(data);
  }
}

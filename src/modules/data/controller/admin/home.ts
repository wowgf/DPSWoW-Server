import { CoolController, BaseController } from '@cool-midway/core';
// import { UserInfoEntity } from '../../../user/entity/info';
import { Get, Inject, Query } from '@midwayjs/core';
import { AppUserDataService } from '../../service/appUser';
import { UserInfoService } from '../../../user/service/info';
import { UserActiveDataService } from '../../service/userActive';
// import { AppArtisanInfoDataService } from '../../service/artisanInfo';
// import { UserDataService } from '../../../user/service/data';
// import { UserWxEntity } from '../../../user/entity/wx';

/**
 * 数据统计
 */
@CoolController({
  api: [],
  entity: null,
})
export class DataAdminController extends BaseController {
  @Inject()
  appUserDataService: AppUserDataService;

  // @Inject()
  // activityDataService: ActivityDataService;

  @Inject()
  userInfoService: UserInfoService



  @Inject()
  userDataService: UserActiveDataService;

  @Get('/data')
  async getHomeData() {
    // 用户信息
    const userCount = await this.appUserDataService.getData();
    // 工匠数据
    // const activityCount = await this.activityDataService.getData();
    // const userOnlineData =  await this.userInfoService.getRealUserStats() // 在线用户数据
    const userActiveData = await this.userDataService.getActiveUserData() // 活跃用户数据,30s缓存
    return this.ok({
      userCount,
      // activityCount,
      // userOnlineData,
      userActiveData
    });
  }

  @Get('/user/active')
  async getActiveUserData(@Query() type: string) {
    let data = await this.userDataService.getActiveUserData();
    return this.ok(data);
  }

  @Get('/user/count')
  async getRealActiveUserData() {
    let data = await this.appUserDataService.getData();
    return this.ok(data);
  }
}

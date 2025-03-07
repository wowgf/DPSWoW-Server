import { BaseCoolQueue, CoolQueue } from '@cool-midway/task';
import { IMidwayApplication } from '@midwayjs/core';
import { App, Inject } from '@midwayjs/decorator';
import { SimcService } from '../service/simc.service';

/**
 * 单例队列，cluster 或 集群模式下 只会有一个实例消费数据
 */
@CoolQueue({ type: 'single' })
export class SimcSingleQueue extends BaseCoolQueue {
  @App()
  app: IMidwayApplication;

  @Inject()
  simcService: SimcService;

  async data(job: any, done: any): Promise<void> {
    // 这边可以执行定时任务具体的业务或队列的业务
    // console.log('消费数据', job.data);
    // 抛出错误 可以让队列重试，默认重试5次
    //throw new Error('错误');
    // 调用队列执行方法
    // this.simcService.processQueue(job.data);
    // this.doit();
    // this.simcService.sleep2(1000);

    done();
  }

  async doit() {
    console.log(123);
    await this.simcService.sleep2(1000);
  }

}

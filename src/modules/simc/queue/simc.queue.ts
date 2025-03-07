// src/queue/test.queue.ts
import { Processor, IProcessor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/decorator';
import { SimcService } from '../service/simc.service';

@Processor('simc')
export class SimcProcessor implements IProcessor {

  @Inject()
  simcService: SimcService;

  async execute(data) {
    // console.log('simc queue数据', data);
    console.log('simc queue数据');
    await this.simcService.processQueue(data);
  }
}
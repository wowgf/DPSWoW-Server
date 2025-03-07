import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserSimcRecordEntity } from '../entity/userSimcRecord';
import * as bull from '@midwayjs/bull';

/**
 * 描述
 */
@Provide()
export class UserSimcRecordService extends BaseService {
  @InjectEntityModel(UserSimcRecordEntity)
  userSimcRecordEntity: Repository<UserSimcRecordEntity>;

  @Inject()
  bullFramework: bull.Framework;

  simcQueue: bull.BullQueue;

  @Init()
  async init() {
    await super.init();
    this.simcQueue = this.bullFramework.getQueue('simc');
  }

  /**
   * 获取用户最近一次的模拟数据
   */
  async getLastRecord(userId: number) {
    return await this.userSimcRecordEntity.findOne({
      where: { userId },
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 根据id获取详情
   */
  async getInfoById(id: string) {
    if (!id) return null;
    return await this.userSimcRecordEntity.findOneBy({ id });
  }

  /**
   * 获取排队情况及simcRecord结果
   * @param recordId 记录id
   */
  async getQueueAndRecord(recordId: string) {
    const userRecord = await this.userSimcRecordEntity.findOneBy({ id: recordId });
    if (!userRecord) {
      throw new Error('记录不存在');
    }
    const jobId = userRecord.jobId;
    // 获取队列中的运行和等待的任务
    const { position, total } = await this.findJobPosition(jobId);

    const record = await this.getInfoById(recordId);
    return {
      queue: { id: jobId, total, position },
      result: record,
    };
  }

  async getRawResultUrl(recordId: string) {
    const record = await this.userSimcRecordEntity.findOneBy({ id: recordId });
    if (!record) {
      throw new Error('记录不存在');
    }
    return record.rawResultUrl;
  }

  /**
   * 获取job在队列中的位置
   * @param jobId 
   * @returns 
   */
  async findJobPosition(jobId) {
    const jobs = await this.simcQueue.getJobs(['waiting', 'active']);
    const job = jobs.find(job => job.id === jobId);

    if (!job) {
      // console.log(`Job ${jobId} is not in the queue.`);
      return { position: -1, total: jobs.length };
    }

    const position = jobs.filter(j => j.timestamp < job.timestamp).length + 1;
    // console.log(`Job ${jobId} is at position ${position} in the queue.`);
    return { position, total: jobs.length };
  }

  /**
   * 获取用户的模拟数据分页列表
   */
  async userPage(userId, params: { [key: string]: any }) {
    const find = this.userSimcRecordEntity.createQueryBuilder('a').select([
      'a.id', 'a.createTime', 'a.status', 'a.cost', 'a.playerInfo', 'a.bestDps', 'a.type'
    ])
      .where('a.userId = :userId', { userId })
      // 非会员只能查看15天数据
      .andWhere('a.createTime > :time', { time: this.getNoMemberTime() })
      .orderBy('a.createTime', 'DESC');

    return this.entityRenderPage(find, params, false);
  }

  /**
   * 获取非会员查询时间
   */
  getNoMemberTime(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 15); // Assuming 15 days for non-members
    return date;
  }
}

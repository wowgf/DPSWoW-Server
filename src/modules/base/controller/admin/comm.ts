import { Provide, Inject, Get, Post, Body, ALL, Files, Fields } from '@midwayjs/decorator';
import { CoolController, BaseController, MODETYPE } from '@cool-midway/core';
import { BaseSysUserEntity } from '../../entity/sys/user';
import { BaseSysLoginService } from '../../service/sys/login';
import { BaseSysPermsService } from '../../service/sys/perms';
import { BaseSysUserService } from '../../service/sys/user';
import { Context } from '@midwayjs/koa';
import { PluginService } from '../../../plugin/service/info';

/**
 * Base 通用接口 一般写不需要权限过滤的接口
 */
@Provide()
@CoolController()
export class BaseCommController extends BaseController {
  @Inject()
  baseSysUserService: BaseSysUserService;

  @Inject()
  baseSysPermsService: BaseSysPermsService;

  @Inject()
  baseSysLoginService: BaseSysLoginService;

  @Inject()
  ctx: Context;

  @Inject()
  pluginService: PluginService;

  /**
   * 获得个人信息
   */
  @Get('/person', { summary: '个人信息' })
  async person() {
    return this.ok(
      await this.baseSysUserService.person(this.ctx.admin?.userId)
    );
  }

  /**
   * 修改个人信息
   */
  @Post('/personUpdate', { summary: '修改个人信息' })
  async personUpdate(@Body(ALL) user: BaseSysUserEntity) {
    await this.baseSysUserService.personUpdate(user);
    return this.ok();
  }

  /**
   * 权限菜单
   */
  @Get('/permmenu', { summary: '权限与菜单' })
  async permmenu() {
    return this.ok(
      await this.baseSysPermsService.permmenu(this.ctx.admin.roleIds)
    );
  }

  /**
  * 文件上传
  */
  @Post('/upload', { summary: '文件上传' })
  async upload(@Files() files, @Fields() fields) {
    const file = await this.pluginService.getInstance('upload');
    const mode = await file.getMode()
    const prefixPath = fields?.prefixPath || 'app/base';
    if (mode.type === 'cos') {
      return this.ok(await file.uploadWithKey(files[0].data, [prefixPath, fields.key].join('/')))
    }
    return this.ok(await file.upload(this.ctx));
  }

  /**
   * 文件上传模式，本地或者云存储
   */
  @Get('/uploadMode', { summary: '文件上传模式' })
  async uploadMode() {
    const file = await this.pluginService.getInstance('upload');
    const modalData = await file.getMode();
    if (modalData.type == 'cos') {
      modalData.mode = MODETYPE.LOCAL
      modalData.type = MODETYPE.LOCAL
    }
    return this.ok(modalData);
  }

  /**
   * 退出
   */
  @Post('/logout', { summary: '退出' })
  async logout() {
    await this.baseSysLoginService.logout();
    return this.ok();
  }

  @Get('/program', { summary: '编程' })
  async program() {
    return this.ok('Node');
  }
}

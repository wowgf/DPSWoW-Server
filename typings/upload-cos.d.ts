/// <reference types="node" />
import {
  BasePlugin,
  BaseUpload,
  Mode,
  PluginInfo,
} from '@cool-midway/plugin-cli';
import COS from 'cos-nodejs-sdk-v5';
/**
 * 描述
 */
export declare class CoolPlugin extends BasePlugin implements BaseUpload {
  client: COS;
  /**
   * 初始化
   * @param pluginInfo
   */
  init(pluginInfo: PluginInfo): Promise<void>;
  /**
   * 获得上传模式
   */
  getMode(): Promise<Mode>;
  /**
   * 获得原始操作对象
   * @returns
   */
  getMetaFileObj(): COS;
  /**
   * 根据给定的 URL 下载文件并返回一个 Buffer。
   * @param {string} url 文件的 URL
   * @return {Promise<Buffer>} 返回一个 Promise，解析为文件内容的 Buffer
   */
  downloadFileAsBuffer(url: any): Promise<Buffer>;
  /**
   * 下载并上传
   * @param url
   * @param fileName 文件名
   */
  downAndUpload(url: string, fileName?: string): Promise<string>;
  /**
   * 指定Key(路径)上传
   * @param filePath 文件路径
   * @param key 路径一致会覆盖源文件
   */
  uploadWithKey(filePath: any, key: any): Promise<string>;
  /**
   * 获得签名
   * @param ctx
   * @returns
   */
  upload(ctx?: any): Promise<unknown>;
}
export declare const Plugin: typeof CoolPlugin;

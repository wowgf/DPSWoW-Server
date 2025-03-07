import * as sms_ali from './sms-ali';
import * as upload_cos from './upload-cos';
import * as upload_oss from './upload-oss';
import { BaseUpload, MODETYPE } from './upload';
type AnyString = string & {};
/**
 * 插件类型声明
 */
interface PluginMap {
  upload: BaseUpload;
  'upload-oss': upload_oss.CoolPlugin;
  'upload-cos': upload_cos.CoolPlugin;
  'sms-ali': sms_ali.CoolPlugin;
}

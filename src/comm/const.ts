// socket操作类型
export const enum SOCKET_ACTION {
  CONNECT = 'connect',
  DISCONNECT = 'disconnnect'
}

export const enum TRACK_ACTION {
  AD_CLICK = 'AD_CLICK', // 广告点击
  AD_SHOW = 'AD_SHOW', // 广告展示
}

export const enum TRACK_ACTION_TYPE {
  CLICK = 'CLICK', // 点击
  SHOW = 'SHOW', // 展示
  CLOSE = 'CLOSE', // 关闭
  STAY = 'STAY', // 停留
}

export enum QRCODE_TYPE {
  LOGIN = 'login',
  BIND = 'bind'
}

export const enum REGISTER_CHANNEL {
  WEB = 'web',
  PC = 'pc',
  MOBILE = 'mobile'
}

/**
 * 微信消息类型
 */
export enum WxMessageType {
  TEXT = 'text',           // 文本消息
  IMAGE = 'image',         // 图片消息
  VOICE = 'voice',         // 语音消息
  VIDEO = 'video',         // 视频消息
  MUSIC = 'music',         // 音乐消息
  NEWS = 'news',           // 图文消息
  EVENT = 'event',         // 事件推送
  LOCATION = 'location',   // 地理位置消息
  LINK = 'link'           // 链接消息
}

/**
 * 微信事件类型
 */
export enum WxEventType {
  SUBSCRIBE = 'subscribe',       // 关注事件
  UNSUBSCRIBE = 'unsubscribe',  // 取消关注事件
  SCAN = 'SCAN',                // 扫描带参数二维码事件
  LOCATION = 'LOCATION',        // 上报地理位置事件
  CLICK = 'CLICK',             // 点击菜单拉取消息事件
  VIEW = 'VIEW'                // 点击菜单跳转链接事件
}
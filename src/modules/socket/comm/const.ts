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


export const USER_SOCKET_MAP_KEY = 'userSocketMap'
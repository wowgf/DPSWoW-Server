interface qrCodeTicketResponse {
  ticket: string;
  expire_seconds: number;
  url: string;
  errcode?: number;
  errmsg?: string;
}


// qrcodeEventResponse{
//   ToUserName: [ 'gh_454abf4d53ee' ],
//   FromUserName: [ 'ovXP26Lyjf8hC-BFxl1R1QxKpwGA' ],
//   CreateTime: [ '1692415942' ],
//   MsgType: [ 'event' ],
//   Event: [ 'SCAN' ],
//   EventKey: [ '6343434a-b4a8-48a8-86a9-09e172e0d669' ],// or qrscene_b5788ba2-8b18-426b-b36a-c0787e0eb945
//   Ticket: [
//     'gQFd8TwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyNndnMXA3WlBmU0UxMDAwMGcwN0wAAgS0NeBkAwQAAAAA'
//   ]
// }
// 回信回调事件数据
interface wxCallbackData {
  ToUserName: string[];
  FromUserName: string[];
  CreateTime: string[];
  MsgType: string[];
  Content?: string[];
  Event: string[];
  EventKey: string[];
  Ticket: string[];
}
// 微信用户信息(含unionid)
interface wxUserInfoResponse {
  subscribe: number;
  openid: string;
  language: string;
  subscribe_time: number;
  unionid: string;
  remark: string;
  groupid: number;
  tagid_list: number[];
  subscribe_scene: string;
  qr_scene: number;
  qr_scene_str: string;
}

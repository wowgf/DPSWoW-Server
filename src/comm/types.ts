export enum QRCODE_TYPE {
  LOGIN = 'login',
  BIND = 'bind'
}

export enum CONFIG_KEY {
  INVITE = 'invite',
  WEBSITE = 'website',
}

// 订单状态 0-待支付 1-已下单 2-已发货(待收货) 3-已收货(待评价) 4-已评价(已完成) 9-已取消
export enum ORDER_STATUS {
  WAIT_PAY = 0,
  ORDERED = 1,
  DELIVERED = 2,
  RECEIVED = 3,
  COMMENTED = 4,
  CANCELED = 9,
}
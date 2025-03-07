# 技术实现思路

## 24.11.05

## 24.12.20

昨天19号发布了新版本11.07，需要重新build，记录一下build过程

### Mac

1. 本地Simc项目同步一下官方simc库
2. 本地Simc项目重新build

```bash
cd your_simc_source_dir/engine
make optimized
cp -f simc ~/project/SimulationCraft
```

### linux

8核16G大概花了20-30分钟编译

```bash
cd /root/simc/engine
make optimized
```

## 25.2.24

### 实现微信群排行榜功能

1. 技术文档：https://developers.weixin.qq.com/miniprogram/dev/api/open-api/group/wx.getGroupEnterInfo.html
2. 用户A发送小程序到微信群 -> 用户B点击小程序 -> if（isLogin） -> 将用户B绑定到该群 -> else 登录 -> 将用户B绑定到该群
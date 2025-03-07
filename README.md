# DPSWoW-Server 🎮⚔️

![License](https://img.shields.io/badge/License-Commons%20Clause%20%2B%20MIT-blue)  ![Version](https://img.shields.io/badge/Version-1.0.0-green)  ![Downloads](https://img.shields.io/npm/dt/wowdps-server)

**DPSWoW-Server**项目 是 [魔兽DPS模拟器（dpswow.com）](https://dpswow.com) 的核心服务端组件，专为《魔兽世界》玩家和开发者设计，提供精准的 DPS 计算、数据分析和队列系统支持。作为 DPSWoW 的一部分，它需要配合前端界面和后台管理端使用。

## ✨ 功能特性

- ✅ **实时 DPS 计算**：支持多角色、多战斗场景的实时 DPS 数据统计。
- ✅ **队列系统**：高效的任务队列管理，支持异步处理大规模 DPS 计算请求。
- ✅ **数据存储与导出**：将战斗数据保存到本地或云端，支持 JSON、CSV 格式导出。
- ✅ **API 支持**：提供 RESTful API，方便开发者集成到自定义工具或应用中。
- **多语言支持**：暂不支持。

## 🚀 快速开始

### 一、编译simc执行程序

编译或下载对应平台（Win、Mac）的可执行文件`simc`,放入项目`/bin`目录下

### 二、启动Node服务

1. 克隆仓库：

   ```bash
   git clone https://github.com/你的用户名/WOWDPS-Server.git
   cd WOWDPS-Server
   ```

2. 安装依赖：

   ```bash
   npm install  # 或使用 yarn install
   ```

3. 启动本地服务：

   ```bash
   npm run dev
   ```

4. 访问本地服务：

   ```
   http://localhost:7002
   ```

### 配置

#### 配置数据库

编辑 `config.default.ts` 文件，配置数据库连接参数

```ts
{
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: 'pwd',
  database: 'db_wowdps_dev',
}
```

## 📚 文档

- [API 文档](./docs/API.md)  
- [开发指南](./docs/DEVELOPMENT.md)  
- [常见问题](./docs/FAQ.md)  

## 🛠️ 技术栈

- **语言**：JavaScript/TypeScript  
- **框架**：Node.js + cool.js + midway.js
- **数据库**：MySQL  
- **消息队列**：Bull.js（基于 Redis）  
- **测试**：Jest + Supertest  
- **部署**：Docker + Nginx  

## 🤝 贡献指南

我们欢迎任何形式的贡献！无论是代码、文档，还是问题反馈，都可以通过以下方式参与：

1. Fork 仓库并创建分支：

   ```bash
   git checkout -b feature/your-feature
   ```

2. 提交更改并推送：

   ```bash
   git commit -m "添加新功能：xxx"
   git push origin feature/your-feature
   ```

3. 提交 Pull Request，并描述你的更改。

4. 加微信反馈：lwbg66

更多细节请参考 [贡献指南](./docs/CONTRIBUTING.md)。

## 📜 开源协议

本项目采用 ["Commons Clause" + MIT 协议](./LICENSE)，允许自由使用、修改和分发代码，但不允许将本软件用于商业销售。详情请参阅LICENSE文件。

## 🌟 支持与反馈

如果你喜欢这个项目，请点个 ⭐ Star 支持我们！  
如有问题或建议，请提交 [Issues](https://github.com/你的用户名/WOWDPS-Server/issues) 或通过邮件联系：<miaoihan@gmail.com>。

## 📌 相关项目

- **DPSWoW 前端**：用户界面，提供直观的 DPS 模拟体验。  
  [GitHub 仓库](https://github.com/你的用户名/DPSWoW-Frontend)

- **DPSWoW 后台管理端**：用于管理用户、任务和数据分析。  
  [GitHub 仓库](https://github.com/你的用户名/DPSWoW-Admin)


## 🎉 致谢

感谢以下项目为 WOWDPS-Server 提供的支持：

- [SimulationCraft](https://github.com/simulationcraft/simc)  
- [Details! Damage Meter](https://www.curseforge.com/wow/addons/details)  
- [Bull.js](https://github.com/OptimalBits/bull)  
- [Node.js](https://nodejs.org)  

**WOWDPS-Server** —— 为 **DPSWoW 魔兽 DPS 模拟器** 提供强大的后端支持，助你精准模拟每一场战斗！🎮⚔️

- **贡献者列表**：  


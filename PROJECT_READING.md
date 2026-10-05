# DPSWoW-Server 项目阅读笔记

## 1. 项目定位

DPSWoW-Server 是 `dpswow.com` 的后端服务，核心职责是承接前端提交的角色/战斗参数，调用 SimulationCraft（`simc`）进行模拟，并提供结果存储、排行榜、公告、用户与管理后台等能力。项目使用 **Midway + cool-admin** 作为基础框架。 

## 2. 技术栈与运行形态

- 语言：TypeScript
- 服务框架：Midway（Koa）
- 基础能力：cool-midway（CRUD/权限/模块化）
- 数据层：TypeORM + MySQL
- 缓存与队列：Redis、Bull
- 实时通信：Socket.IO（Redis Adapter）
- 任务调度：@cool-midway/task + @midwayjs/cron

默认 HTTP 端口为 `7002`。

## 3. 启动流程（代码视角）

`src/configuration.ts` 在应用启动时做了几件关键事：

1. 注册核心组件（Koa、ORM、上传、缓存、Socket、Swagger、队列等）。
2. `onReady` 时清理 socket 缓存。
3. 给 socket 挂载连接中间件 `SocketTokenMiddleware`。
4. 注册全局限流守卫 `ThrottlerGuard`。

这说明服务的“请求入口”不仅有 HTTP API，还包含 socket 连接生命周期。

## 4. 配置结构（`src/config/*.ts`）

配置集中在 `src/config/config.default.ts`（并通过 local/prod 覆盖）：

- `koa.port = 7002`
- `bodyParser` 允许 `json/form/text/xml`
- `cacheManager` 默认走 Redis
- `socketIO` 使用 Redis 适配器（支持多实例）
- `bull.defaultQueueOptions` 也复用同一套 Redis
- `cool.crud` 开启软删除

换言之，**Redis 是该项目的基础设施中心**（缓存、队列、socket 广播都依赖）。

## 5. 模块划分（`src/modules`）

仓库采用典型的业务模块化结构，每个模块通常包含 `config + controller + service + entity`：

- 基础能力：`base`、`plugin`、`task`、`space`
- 账号与用户：`user`、`wx`、`bigfoot`
- 核心业务：`simc`（模拟计算）、`rank`（排行）、`point`（积分）
- 内容与运营：`notice`、`banner`、`adverts`
- 数据支撑：`data`、`track`、`dict`
- 即时能力：`socket`、`conversation`
- 魔兽相关数据：`wowdata`、`wowserver`

其中 `simc` 模块是最关键业务模块，包含队列、文件模板、结果处理与统计计算逻辑。

## 6. 重点阅读建议（给后续开发）

若要快速进入业务，建议按下面顺序阅读：

1. `src/configuration.ts`（应用生命周期与组件装配）
2. `src/config/config.default.ts`（全局基础设施依赖）
3. `src/modules/simc/**`（核心业务）
4. `src/modules/socket/**`（实时任务通知/会话）
5. `src/modules/base/**`（鉴权、权限、通用中间件）

## 7. 当前代码库可见风险（阅读结论）

从配置文件可直接看到多类明文凭据（如 JWT Secret、微信 AppID/Secret、第三方接口密钥等）。建议尽快改为环境变量注入，并在仓库历史中清理敏感信息。

## 8. 一句话总结

这是一个以 **SIMC 计算链路 + Redis 基础设施 + Midway 模块化管理后台** 为核心的后端项目；如果你要做功能迭代，优先理解 `simc`、`socket`、`base` 三条主线。

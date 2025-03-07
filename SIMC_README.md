# simc的一些概念研究

## 生成json结果的研究

| 字段名称 | 描述 |
| --- | --- |
| version | 模拟软件的版本号。 |
| report_version | 报告的版本号。 |
| ptr_enabled | 是否启用了PTR（公共测试服务器）模式。 |
| beta_enabled | 是否启用了beta测试模式。 |
| build_date | 构建日期。 |
| build_time | 构建时间。 |
| timestamp | 时间戳。 |
| git_revision | Git版本控制的修订号。 |
| git_branch | Git版本控制的分支名。 |
| sim | 模拟的配置和结果。 |
| &nbsp;&nbsp;&nbsp;&nbsp;options | 一系列模拟选项，如调试模式、最大时间、预期迭代时间等。 |
| &nbsp;&nbsp;&nbsp;&nbsp;overrides | 覆盖默认设置的选项。 |
| &nbsp;&nbsp;&nbsp;&nbsp;players | 参与模拟的玩家信息，包括角色名、种族、等级、职业等。 |
| &nbsp;&nbsp;&nbsp;&nbsp;collected_data | 收集的数据，包括战斗长度、等待时间、执行的动作次数、总伤害等。 |
| &nbsp;&nbsp;&nbsp;&nbsp;action_sequence_precombat | 战斗前的动作序列。 |
| &nbsp;&nbsp;&nbsp;&nbsp;action_sequence | 战斗中的动作序列，详细记录了每个动作的时间、ID、名称、目标、使用的法术、资源消耗等。 |
| dbc | 数据库信息，包括游戏版本、构建级别、热修复日期等。 |
| profileset_metric | 用于评估的指标，通常是DPS。 |
| profileset_multiactor_base_name | 多行动者基准的名称。 |
| rng | 随机数生成器的名称。 |
| deterministic | 模拟是否是确定性的。 |
| fight_style | 战斗风格，例如“Patchwerk”。 |
| desired_targets | 期望的目标数量。 |
| profile_source | 配置文件的来源。 |

## 战斗输出占比日志

1. 伤害分析：stats
2. Buff持续时间：buffs
3. 技能战斗日志：取collected_data.action_sequence

## json字段解释

### procs

`procs` 记录了战斗中触发效果（proc）的情况：

- **name**: 触发效果的名称
- **interval**: 平均触发间隔时间
- **count**: 总触发次数

### gains

`gains` 记录了战斗中资源（如怒气、法力等）的获取情况：

- **name**: 资源获取的来源
- **rage**: 怒气获取的详细信息
  - **actual**: 实际获取的怒气值
  - **overflow**: 溢出的怒气值
- **count**: 获取次数

### stats

`stats` 记录了战斗中各种统计数据，可能包括以下内容：

- 伤害统计（如总伤害、平均伤害、暴击率等）
- 资源使用情况（如法力消耗、怒气消耗等）
- 技能使用情况（如技能施放次数、命中率等）
- 其他战斗相关的统计数据

这些数据用于详细分析战斗中的表现，帮助玩家或开发者了解角色在不同情况下的输出和资源管理情况。

### 伤害分析

**基本信息**

- **id**: 0
- **spell_name**: 空字符串，表示这是普通攻击而不是技能
- **name**: "auto_attack_mh" - 主手自动攻击
- **school**: "physical" - 物理伤害
- **type**: "damage" - 伤害类型

**执行次数**

- **num_executes**: 执行次数统计
  - **sum**: 总执行次数 319519
  - **count**: 统计样本数 999
  - **mean**: 平均每次模拟执行次数 319.84

**伤害统计**

- **compound_amount**: 总伤害 4971520.15
- **total_execute_time**: 总执行时间统计
  - **sum**: 总时间 357652.29 秒
  - **count**: 统计样本数 999
  - **mean**: 平均每次模拟执行时间 358.01 秒

**每秒伤害（APS）**

- **portion_aps**: 每秒伤害统计
  - **sum**: 总APS 16560504.69
  - **count**: 统计样本数 999
  - **mean**: 平均APS 16577.08
  - **min**: 最小APS 14558.11
  - **max**: 最大APS 19234.60

**实际伤害**

- **actual_amount**: 实际伤害统计
  - **sum**: 总伤害 4966548632.69
  - **count**: 统计样本数 999
  - **mean**: 平均伤害 4971520.15
  - **min**: 最小伤害 3706534.69
  - **max**: 最大伤害 6570897.53

**总伤害**

- **total_amount**: 总伤害统计
  - **sum**: 总伤害 7095062380.20
  - **count**: 统计样本数 999
  - **mean**: 平均伤害 7102164.54
  - **min**: 最小伤害 5295044.26
  - **max**: 最大伤害 9386987.09

**直接结果统计**

- **num_direct_results**: 直接结果次数统计
  - **sum**: 总次数 319519
  - **count**: 统计样本数 999
  - **mean**: 平均次数 319.84

**直接结果详细信息**

- **direct_results**: 直接结果的详细统计，包括暴击和命中
  - **crit**: 暴击统计
    - **actual_amount**: 实际暴击伤害
      - **sum**: 总暴击伤害 1585957874.91
      - **count**: 暴击次数 60600
      - **mean**: 平均暴击伤害 26170.92
      - **min**: 最小暴击伤害 13776.74
      - **max**: 最大暴击伤害 47696.43
    - **count**: 暴击次数统计
      - **sum**: 总暴击次数 60340
      - **count**: 统计样本数 999
      - **mean**: 平均暴击次数 60.40
      - **min**: 最小暴击次数 27
      - **max**: 最大暴击次数 94
    - **pct**: 暴击率 18.88%
  - **hit**: 命中统计
    - **actual_amount**: 实际命中伤害
      - **sum**: 总命中伤害 3400838247.66
      - **count**: 命中次数 260200
      - **mean**: 平均命中伤害 13070.09
      - **min**: 最小命中伤害 6888.37
      - **max**: 最大命中伤害 23312.33
    - **count**: 命中次数统计
      - **sum**: 总命中次数 259179
      - **count**: 统计样本数 999
      - **mean**: 平均命中次数 259.44
      - **min**: 最小命中次数 191
      - **max**: 最大命中次数 328
    - **pct**: 命中率 81.12%

覆盖时间
stats.total_tick_time.mean / 总时间

这些数据用于详细分析自动攻击在战斗中的表现，包括伤害输出、暴击和命中情况等。


## 开发经验

- 战斗分析：用simc.player[0].stats
- buff持续时间：simc.player[0].buffs
- 技能战斗日志：simc.player[0].collected_data.action_sequence


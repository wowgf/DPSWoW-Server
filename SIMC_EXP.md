# 解释

```js
const 解释 = {
  "id": 227847, // 技能ID
  "spell_name": "Bladestorm", // 技能名称
  "name": "bladestorm", // 技能内部名称
  "school": "physical", // 伤害类型（物理）
  "type": "damage", // 类型（伤害）
  "num_executes": { // 执行次数统计
    "sum": 7743.0, // 总执行次数
    "count": 999, // 统计样本数
    "mean": 7.7507507507507509 // 平均每次模拟执行次数
  },
  "compound_amount": 17497103.144454574, // 总伤害
  "total_execute_time": { // 总执行时间统计
    "sum": 8110.836999999997, // 总时间
    "count": 999, // 统计样本数
    "mean": 8.118955955955953 // 平均每次模拟执行时间
  },
  "total_intervals": { // 总间隔时间统计
    "sum": 68803.09399999997, // 总间隔时间
    "count": 1680, // 统计样本数
    "mean": 40.9542226190476 // 平均间隔时间
  },
  "num_ticks": { // 持续伤害
    "sum": 70818.0, // 总Tick次数
    "count": 999, // 统计样本数
    "mean": 70.88888888888889 // 平均每次模拟Tick次数
  },
  "total_tick_time": { // 持续伤害技能时间
    "sum": 32032.99300000001, // 总Tick时间
    "count": 999, // 统计样本数
    "mean": 32.06505805805807 // 平均每次模拟Tick时间
  },
  "children": [ // 子技能统计
    {
      "id": 50622, // 子技能ID
      "spell_name": "Bladestorm", // 子技能名称
      "name": "bladestorm_mh", // 子技能内部名称
      "school": "physical", // 伤害类型（物理）
      "type": "damage", // 类型（伤害）
      "num_executes": { // 执行次数统计
        "sum": 0.0, // 总执行次数
        "count": 999, // 统计样本数
        "mean": 0.0 // 平均每次模拟执行次数
      },
      "compound_amount": 6908723.976610219, // 总伤害
      "portion_aps": { // 每秒伤害统计
        "sum": 23009079.914012467, // 总APS
        "count": 999, // 统计样本数
        "mean": 23032.112026038503, // 平均APS
        "min": 16761.036874048947, // 最小APS
        "max": 30382.386131122596 // 最大APS
      },
      "portion_apse": { // 每秒有效伤害统计
        "sum": 23009079.914012467, // 总APSE
        "count": 999, // 统计样本数
        "mean": 23032.112026038503, // 平均APSE
        "min": 16761.036874048947, // 最小APSE
        "max": 30382.386131122596 // 最大APSE
      },
      "portion_amount": 0.06625852887480847, // 伤害占比
      "actual_amount": { // 实际伤害统计
        "sum": 6901815252.633609, // 总伤害
        "count": 999, // 统计样本数
        "mean": 6908723.976610219, // 平均伤害
        "min": 4324600.948746048, // 最小伤害
        "max": 9770975.379769028 // 最大伤害
      },
      "total_amount": { // 总伤害统计
        "sum": 9859726215.454792, // 总伤害
        "count": 999, // 统计样本数
        "mean": 9869595.811266058, // 平均伤害
        "min": 6177995.177350141, // 最小伤害
        "max": 13958522.29827664 // 最大伤害
      },
      "num_direct_results": { // 直接结果次数统计
        "sum": 70818.0, // 总次数
        "count": 999, // 统计样本数
        "mean": 70.88888888888889 // 平均次数
      },
      "direct_results": { // 直接结果详细统计
        "crit": { // 暴击统计
          "actual_amount": { // 实际暴击伤害
            "sum": 2274084566.9231536, // 总暴击伤害
            "count": 13313, // 暴击次数
            "mean": 170816.83819748768, // 平均暴击伤害
            "min": 85942.7595865948, // 最小暴击伤害
            "max": 259646.097410398 // 最大暴击伤害
          },
          "avg_actual_amount": { // 平均实际暴击伤害
            "sum": 170859816.91076399, // 总暴击伤害
            "count": 999, // 统计样本数
            "mean": 171030.8477585225, // 平均暴击伤害
            "min": 132718.5043078999, // 最小暴击伤害
            "max": 209450.35800848335 // 最大暴击伤害
          },
          "total_amount": { // 总暴击伤害
            "sum": 3248688989.7694046, // 总暴击伤害
            "count": 13313, // 暴击次数
            "mean": 244023.8105437846 // 平均暴击伤害
          },
          "fight_actual_amount": { // 战斗实际暴击伤害
            "sum": 2261433548.009055, // 总战斗暴击伤害
            "count": 999, // 统计样本数
            "mean": 2263697.2452543096 // 平均战斗暴击伤害
          },
          "fight_total_amount": { // 战斗总暴击伤害
            "sum": 3230616123.679297, // 总战斗暴击伤害
            "count": 999, // 统计样本数
            "mean": 3233849.97365295 // 平均战斗暴击伤害
          },
          "overkill_pct": { // 过量伤害百分比
            "sum": 29969.930069930004, // 总过量伤害百分比
            "count": 999, // 统计样本数
            "mean": 29.999929999929934 // 平均过量伤害百分比
          },
          "count": { // 暴击次数统计
            "sum": 13242.0, // 总暴击次数
            "count": 999, // 统计样本数
            "mean": 13.255255255255256, // 平均暴击次数
            "min": 3.0, // 最小暴击次数
            "max": 28.0 // 最大暴击次数
          },
          "pct": 18.69863594001525 // 暴击率
        },
        "hit": { // 命中统计
          "actual_amount": { // 实际命中伤害
            "sum": 4659154926.697668, // 总命中伤害
            "count": 57803, // 命中次数
            "mean": 80604.03312453797, // 平均命中伤害
            "min": 40925.12361266419, // 最小命中伤害
            "max": 123655.59607703361 // 最大命中伤害
          },
          "avg_actual_amount": { // 平均实际命中伤害
            "sum": 80517366.76987936, // 总命中伤害
            "count": 999, // 统计样本数
            "mean": 80597.96473461397, // 平均命中伤害
            "min": 70693.55453604726, // 最小命中伤害
            "max": 97080.15600064535 // 最大命中伤害
          },
          "total_amount": { // 总命中伤害
            "sum": 6655928953.632467, // 总命中伤害
            "count": 57803, // 命中次数
            "mean": 115148.50360072086 // 平均命中伤害
          },
          "fight_actual_amount": { // 战斗实际命中伤害
            "sum": 4640381704.624553, // 总战斗命中伤害
            "count": 999, // 统计样本数
            "mean": 4645026.731355908 // 平均战斗命中伤害
          },
          "fight_total_amount": { // 战斗总命中伤害
            "sum": 6629110091.7755, // 总战斗命中伤害
            "count": 999, // 统计样本数
            "mean": 6635745.837613113 // 平均战斗命中伤害
          },
          "overkill_pct": { // 过量伤害百分比
            "sum": 29969.930069930007, // 总过量伤害百分比
            "count": 999, // 统计样本数
            "mean": 29.999929999929937 // 平均过量伤害百分比
          },
          "count": { // 命中次数统计
            "sum": 57576.0, // 总命中次数
            "count": 999, // 统计样本数
            "mean": 57.633633633633639, // 平均命中次数
            "min": 31.0, // 最小命中次数
            "max": 83.0 // 最大命中次数
          },
          "pct": 81.30136405998475 // 命中率
        }
      }
    },
  ]
}
```

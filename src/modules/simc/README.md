# SimulationCraft开发经验

## 参数概念

1. iterations-迭代次数，运行模拟的次数
2. max_time（scope： global;default： 300）：是你希望的平均战斗持续时间的持续时间，以秒为单位
3. threads （scope： global;默认值： 0）：是用于执行计算的线程数。值 0 或更小将使用与系统上可用的 CPU 线程数一样多的线程
4. fight_style
    - 详细描述 fight_style 参数的作用和使用方法。
    - 示例：
        - `fight_style=Patchwerk`：模拟站桩输出。
          - Patchwerk will set up an empty raid events list. This is a perfect stand still, single-target DPS fight. The name comes from the iconic DPS check fight from Naxxramas.
        - `fight_style=CastingPatchwerk`：模拟站桩输出，但主目标会施法。
          - CastingPatchwerk will set up a fight similar to Patchwerk but the master target will be casting instead. It is equivalent to:
        - `fight_style=LightMovement`：模拟轻微移动战斗。
          - LightMovement will set up a fight with infrequent movement. It is equivalent to:
        - `fight_style=HeavyMovement`：模拟频繁移动战斗。
          - HeavyMovement will set up a fight with frequent movement. It is equivalent to:
        - `fight_style=DungeonSlice`：模拟M+地下城的一部分。
          - DungeonSlice approximates a "slice" of a M+ dungeon. A single boss mob followed by alternating then interleaving large/weak trash packs (4-6 mobs for 18 seconds) and small/strong trash packs (1-3 mobs for 30 seconds). Durations are randomized on a per-enemy basis within 2 standard deviations of the mean. Due to the offset cooldowns, all add waves beyond the first of each type can potentially overlap, leading to a semi-random pattern between 1-9 enemies at any given time, with an average target count across the entire duration (including as enemies "die") of 4. Fight length locked to 6 minutes. Events are equivalent to:
        - `fight_style=DungeonRoute`：允许定义拉怪事件以模拟一系列敌人。
          - DungeonRoute has no events of its own but allows for pull events to be defined to simulate a series of enemies spawned with lifetimes determined by their health pools.
        - `fight_style=HecticAddCleave`：模拟定期生成小怪和频繁移动的战斗。
          - HecticAddCleave will set up a fight with regular add spawns and frequent movement. Similar to the Tier15 encounter Horridon (but without the vulnerability on the boss). The events scale with max_time, with 450 it is the same as:
        - `fight_style=HelterSkelter`：模拟“疯狂”的战斗。
          - HelterSkelter will set up a "crazy" fight. It is equivalent to:
        - `fight_style=CleaveAdd`：模拟定期生成小怪并被角色击杀的战斗。
          - CleaveAdd will set up a fight that regularly spawns an add the actor cleaves down. The event scales with your input max_time, with 450 it is the same as:
5. desired_targets=X： 敌人数量
6. report_details（默认1）：报告详细信息的级别。设置为 1 以获得详细的报告，0更简单

## 详解

`calculate_scale_factors` 是 SimulationCraft（simc）中的一个参数，用于计算角色属性的权重（scale factors）。这些权重用于评估不同属性对角色输出的影响，从而帮助玩家优化装备和属性选择。

详细解释
在 SimulationCraft 中，calculate_scale_factors 参数启用后，模拟器会计算角色的各项属性（如力量、敏捷、智力、暴击、急速、精通、全能等）对输出的影响。具体来说，它会通过以下步骤计算属性权重：

基线模拟：首先进行一次基线模拟，记录角色的基础输出。
属性增量模拟：然后分别增加每种属性的数值（通常是增加 1% 或 100 点），再次进行模拟，记录输出变化。
计算权重：通过比较基线输出和属性增量后的输出，计算每种属性的权重。
示例
在 simc 配置文件中，可以通过设置 calculate_scale_factors=1 来启用属性权重计算：

输出
启用 calculate_scale_factors 后，SimulationCraft 会在输出报告中包含每种属性的权重信息。例如：

这些权重值表示每增加一点对应属性，角色输出的相对提升。例如，在上述示例中，增加一点力量会比增加一点暴击带来更高的输出提升。

应用
玩家可以根据这些属性权重来优化装备选择和属性分配。例如，如果力量的权重最高，那么优先选择增加力量的装备和宝石会更有利于提升输出。

总结
calculate_scale_factors 是一个非常有用的参数，可以帮助玩家了解不同属性对角色输出的影响，从而做出更明智的装备和属性选择。

## tips

1. log=1 后 iterations将强制=1
    - 这是因为启用日志记录会显著增加计算量，因此强制将迭代次数设置为 1 以减少计算时间

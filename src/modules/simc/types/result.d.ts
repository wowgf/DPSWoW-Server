/**
 * SimC结果数据类型定义
 */

export interface SimcResult {
  version: string;
  result: number;
  revision: string;
  ptr_enabled: boolean;
  beta_enabled: boolean;
  build_date: string;
  build_time: string;
  timestamp: number;
  git_revision: string;
  sim: {
    options: {
      debug: boolean;
      max_time: number;
      expected_iteration_time: number;
      vary_combat_length: number;
      iterations: number;
      target_error: number;
      threads: number;
      seed: number;
      single_actor_batch: boolean;
      queue_lag: number;
      queue_lag_stddev: number;
      gcd_lag: number;
      gcd_lag_stddev: number;
      channel_lag: number;
      channel_lag_stddev: number;
      queue_gcd_reduction: number;
      strict_gcd_queue: boolean;
      confidence: number;
      confidence_estimator: number;
      world_lag: number;
      world_lag_stddev: number;
      travel_variance: boolean;
      default_skill: number;
      reaction_time: number;
      regen_periodicity: number;
      ignite_sampling_delta: number;
      fixed_time: boolean;
      optimize_expressions: boolean;
      optimal_raid: number;
      log: number;
      debug_each: number;
      stat_cache: number;
      max_aoe_enemies: number;
      show_etmi: boolean;
      tmi_window_global: number;
      tmi_bin_size: number;
    };
    statistics: {
      elapsed_cpu_seconds: number;
      elapsed_time_seconds: number;
      init_time_seconds: number;
      merge_time_seconds: number;
      analyze_time_seconds: number;
      simulation_length: {
        mean: number;
        min: number;
        max: number;
        stddev: number;
      };
      raid_dps: {
        mean: number;
        min: number;
        max: number;
        stddev: number;
      };
      total_iterations: number;
      total_events_processed: number;
      raid_waiting_time: {
        mean: number;
        min: number;
        max: number;
        stddev: number;
      };
      raid_executed_time: {
        mean: number;
        min: number;
        max: number;
        stddev: number;
      };
    };
    players: Array<{
      name: string;
      race: string;
      level: number;
      role: string;
      position: string;
      specialization: string;
      profile_source: string;
      talents: string[];
      party: number;
      ready_type: number;
      bugs: boolean;
      scale_player: boolean;
      potion_used: boolean;
      timeofday: string;
      dps: number;
      collected_data: {
        fight_length: {
          mean: number;
          min: number;
          max: number;
          stddev: number;
        };
        dps: {
          mean: number;
          min: number;
          max: number;
          stddev: number;
        };
        prioritydps: {
          mean: number;
          min: number;
          max: number;
          stddev: number;
        };
        dpse: {
          mean: number;
          min: number;
          max: number;
          stddev: number;
        };
        resource_lost: {
          mean: number;
          min: number;
          max: number;
          stddev: number;
        };
        resource_overflowed: {
          mean: number;
          min: number;
          max: number;
          stddev: number;
        };
        waiting_time: {
          mean: number;
          min: number;
          max: number;
          stddev: number;
        };
        executed_time: {
          mean: number;
          min: number;
          max: number;
          stddev: number;
        };
      };
      buffs: Array<{
        name: string;
        spell_name: string;
        spell_school: string;
        start_count: number;
        refresh_count: number;
        interval: number;
        trigger: number;
        uptime: number;
        benefit: number;
        overflow_stacks: number;
        overflow_total: number;
      }>;
      stats: {
        strength: number;
        agility: number;
        stamina: number;
        intellect: number;
        spirit: number;
        spell_power: number;
        attack_power: number;
        spell_crit_rating: number;
        spell_hit_rating: number;
        spell_haste_rating: number;
        expertise_rating: number;
        armor: number;
        miss_rating: number;
        dodge_rating: number;
        parry_rating: number;
        block_rating: number;
        mastery_rating: number;
        versatility_rating: number;
        leech_rating: number;
        speed_rating: number;
        avoidance_rating: number;
        corruption: number;
        corruption_resistance: number;
      };
      gear: {
        items: Array<{
          id: number;
          slot: string;
          quality: string;
          name: string;
          level: number;
          stats: {
            [key: string]: number;
          };
          gems: Array<{
            id: number;
            quality: string;
            name: string;
            stats: {
              [key: string]: number;
            };
          }>;
          enchant: {
            id: number;
            name: string;
            stats: {
              [key: string]: number;
            };
          };
        }>;
      };
    }>;
    profilesets?: {
      results: Array<{
        name: string;
        mean: number;
        min: number;
        max: number;
        stddev: number;
        mean_std_dev: number;
        mean_error: number;
        iterations: number;
        overrides?: {
          [key: string]: string | number;
        };
        additional_metrics?: Array<{
          metric: string;
          mean: number;
          min: number;
          max: number;
          stddev: number;
        }>;
        // rank: number;
        improvement: number;
      }>;
      metric: string;
      iterations: number;
      has_scale_factors: boolean;
      sorted_data_keys: string[];
    };
  };
}

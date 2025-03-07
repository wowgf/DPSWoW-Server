export interface SimulationOptions {
  fight_style: string;
  desired_targets: number;
  max_time: number;
  iterations?: number;
  stat_weights?: number;
  buffs?: { key: string; value: number }[];
  consumables?: {
    food: string | undefined;
    flask: string | undefined;
    potion: string | undefined;
    augmentation: string | undefined;
    weapon: string | undefined;
  };
  [key: string]: any;
}
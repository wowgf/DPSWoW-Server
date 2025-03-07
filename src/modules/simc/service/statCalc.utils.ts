// 11.0的属性系数
export const STAT_CONSTANTS = {
  CRIT: 170,       // 暴击
  HASTE: 170,      // 急速
  MASTERY: 180,    // 精通
  VERSATILITY: 205,// 全能
  AVOIDANCE: 14,   // 闪避
  LEECH: 21,       // 吸血
  SPEED: 10        // 加速
};

// 计算属性百分比
export function calculatePercentage(rating: number, statType: keyof typeof STAT_CONSTANTS): number {
  const constant = STAT_CONSTANTS[statType];
  return rating / constant;
}

// 示例使用
export function getCritPercentage(critRating: number): number {
  return calculatePercentage(critRating, 'CRIT');
}

export function getHastePercentage(hasteRating: number): number {
  return calculatePercentage(hasteRating, 'HASTE');
}


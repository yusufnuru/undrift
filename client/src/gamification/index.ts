export type {
  GamificationData,
  GamificationSessionCtx,
  GamificationCounters,
  XPSource,
  XPEvent,
  EarnedAchievement,
  AchievementDefinition,
  AchievementTier,
  AchievementCategory,
} from "./types";

export { ACHIEVEMENT_DEFINITIONS, ACHIEVEMENT_XP } from "./achievements";
export { calculateLevel, getXPForLevel, getXPProgress, getLevelTitle } from "./levels";
export {
  createDefaultGamificationData,
  createDefaultSessionCtx,
  awardXP,
  updateCounters,
  checkAchievements,
} from "./engine";
export type { CounterEvent } from "./engine";
export {
  getGamificationData,
  saveGamificationData,
  getSessionCtx,
  saveSessionCtx,
} from "./storage";

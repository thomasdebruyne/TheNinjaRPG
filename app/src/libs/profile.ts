import type { UserData } from "@/drizzle/schema";

export const HP_PER_LVL = 50;
export const SP_PER_LVL = 50;
export const CP_PER_LVL = 50;
export const COST_CHANGE_USERNAME = 5;
export const COST_SWAP_BLOODLINE = 0; // TODO: Should be determined by rank
export const COST_RESET_STATS = 0; // TODO: Should be 5
export const MAX_ATTRIBUTES = 5;

export function calcLevelRequirements(level: number): number {
  const prevLvl = level - 1;
  const cost = 500 + prevLvl * 500;
  const prevCost = prevLvl > 0 ? calcLevelRequirements(prevLvl) : 0;
  return cost + prevCost;
}

export const calcLevel = (experience: number) => {
  let level = 1;
  let exp = 0;
  while (exp < experience) {
    exp += 500 + level * 500;
    if (exp < experience) {
      level += 1;
    }
  }
  return level;
};

export const calcHP = (level: number) => {
  return 100 + HP_PER_LVL * (level - 1);
};

export const calcSP = (level: number) => {
  return 100 + SP_PER_LVL * (level - 1);
};

export const calcCP = (level: number) => {
  return 100 + CP_PER_LVL * (level - 1);
};

type StatDistribution = {
  ninjutsuOffence: number;
  ninjutsuDefence: number;
  genjutsuOffence: number;
  genjutsuDefence: number;
  taijutsuOffence: number;
  taijutsuDefence: number;
  bukijutsuOffence: number;
  bukijutsuDefence: number;
  strength: number;
  intelligence: number;
  willpower: number;
  speed: number;
};

/** Scale stats of user, and return total number of experience / stat points */
export function scaleUserStats(user: UserData) {
  // Pools
  user["curHealth"] = calcHP(user.level);
  user["maxHealth"] = calcHP(user.level);
  user["curStamina"] = calcSP(user.level);
  user["maxStamina"] = calcSP(user.level);
  user["curChakra"] = calcCP(user.level);
  user["maxChakra"] = calcCP(user.level);
  // Stats
  const exp = calcLevelRequirements(user.level) - 500;
  user["experience"] = exp;
  const sum = [
    user.ninjutsuOffence ?? 0,
    user.ninjutsuDefence ?? 0,
    user.genjutsuOffence ?? 0,
    user.genjutsuDefence ?? 0,
    user.taijutsuOffence ?? 0,
    user.taijutsuDefence ?? 0,
    user.bukijutsuOffence ?? 0,
    user.bukijutsuDefence ?? 0,
    user.strength ?? 0,
    user.intelligence ?? 0,
    user.willpower ?? 0,
    user.speed ?? 0,
  ].reduce((a, b) => a + b, 0);
  const calcStat = (stat: keyof StatDistribution) => {
    return 10 + Math.floor(((user[stat] ?? 0) / sum) * exp * 100) / 100;
  };
  user["ninjutsuOffence"] = calcStat("ninjutsuOffence");
  user["ninjutsuDefence"] = calcStat("ninjutsuDefence");
  user["genjutsuOffence"] = calcStat("genjutsuOffence");
  user["genjutsuDefence"] = calcStat("genjutsuDefence");
  user["taijutsuOffence"] = calcStat("taijutsuOffence");
  user["taijutsuDefence"] = calcStat("taijutsuDefence");
  user["bukijutsuOffence"] = calcStat("bukijutsuOffence");
  user["bukijutsuDefence"] = calcStat("bukijutsuDefence");
  user["strength"] = calcStat("strength");
  user["intelligence"] = calcStat("intelligence");
  user["willpower"] = calcStat("willpower");
  user["speed"] = calcStat("speed");
}

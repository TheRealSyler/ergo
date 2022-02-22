import { ATTACK_ACTIVE_TIME } from '../animation/attackState';
import { NumberRange } from '../utils';
import { BaseExponent, Character, expGainAtLevel, expToNextLevel } from './character';
import { ConsumableItem, Item, ITEMS, ItemWithStatChange } from './items';
import { BLOCK_TIME } from '../animation/blockState';

export interface CharacterStats {
  aiTimeToAttack: NumberRange
  aiDodgeChance: number
  aiBlockChance: number
  /**Chance that the ai will dodge instead of blocking */
  aiUseDodge: number
  attackSpeed: number
  dodgeSpeed: number
  hitTime: number
  staminaRegenRate: number
  attackStaminaCost: number
  dodgeStaminaCost: number
  blockStaminaCost: number
  damage: NumberRange
  maxHealth: number
  health: number
  maxStamina: number
  stamina: number
}

export type CharacterClass = 'base' | 'awd2' | 'boss';
// TODO find better name.
export const FLIPPED_STAT_SIGN: Partial<Record<keyof CharacterStats, true>> = {
  dodgeStaminaCost: true,
  attackStaminaCost: true,
  dodgeSpeed: true
}

const BASE_STATS: CharacterStats = {
  damage: NumberRange(3, 7),
  attackSpeed: 1,
  maxHealth: 25,
  maxStamina: 10,
  dodgeSpeed: 0.2,
  aiDodgeChance: 0.3,
  aiBlockChance: 0.3,
  aiUseDodge: 0.5,
  aiTimeToAttack: NumberRange(0.5, 1.5),
  hitTime: 1.5,
  staminaRegenRate: 5,
  attackStaminaCost: 5,
  dodgeStaminaCost: 1,
  blockStaminaCost: 2,
  health: 25,
  stamina: 25,
}

function getCharacterBaseStats(charClass: CharacterClass): CharacterStats {
  const baseCopy = JSON.parse(JSON.stringify(BASE_STATS)) as CharacterStats;
  switch (charClass) {
    case 'base':
      return baseCopy
    case 'awd2':
      baseCopy.maxHealth = 100
      baseCopy.aiTimeToAttack = NumberRange(0.2, 1.3)
      baseCopy.attackSpeed = 1.1
      baseCopy.maxStamina = 20
      baseCopy.damage = NumberRange(20, 30)
      return baseCopy
    case 'boss':
      baseCopy.maxHealth = 120
      baseCopy.aiTimeToAttack = NumberRange(0.1, 1)
      baseCopy.attackSpeed = 1.3
      baseCopy.maxStamina = 30
      baseCopy.damage = NumberRange(20, 30)
      return baseCopy
  }
}

export function createStats(character: Character): CharacterStats {
  const stats = getCharacterBaseStats(character.class);

  applyCharacterItems(character, stats);
  applyLevel(character.level, stats, true)
  stats.health = stats.maxHealth
  stats.stamina = stats.maxStamina

  return stats
}

function applyLevel(level: number, stats: CharacterStats, add: boolean) {
  // stats.aiDodgeChance = Math.min(75, stats.aiDodgeChance + level)
  // stats.aiBlockChance = Math.min(75, stats.aiDodgeChance + level)
  // graph for visualization https://www.desmos.com/calculator/obq0ttbnlg
  applyStatChange(stats, 'damage', NumberRange(BaseExponent(level, 0.95, 1.1), BaseExponent(level, 1.2, 1.1)), add)
  applyStatChange(stats, 'maxHealth', BaseExponent(level, 2.1, 0.9), add)
  applyStatChange(stats, 'maxStamina', BaseExponent(level, 0.2, 1.15), add)
}

export function useConsumable(character: Character, stats: CharacterStats, item: ConsumableItem) {
  const health = item.effect.health;
  const exp = item.effect.exp;
  if (health === 'Full') {
    stats.health = stats.maxHealth;
  } else if (health) {
    stats.health = Math.min(stats.maxHealth, stats.health + (stats.maxHealth * (health / 100)));
  }
  if (exp === 'Level') {
    LevelCharacter(character, stats, expGainAtLevel(character.level))
  } else if (exp) {
    LevelCharacter(character, stats, exp)
  }
}

export function LevelCharacter(character: Character, stats: CharacterStats, exp: number) {
  const totalExp = character.exp + exp
  const expToLevelUp = expToNextLevel(character.level);
  if (totalExp >= expToLevelUp) {
    character.level++
    character.skillPoints++
    character.exp = 0
    applyLevel(character.level - 1, stats, false)
    applyLevel(character.level, stats, true)
    const remainingExp = totalExp - expToLevelUp
    LevelCharacter(character, stats, remainingExp)
  } else {
    character.exp = totalExp
  }
}

export function updateStatsWithItem(stats: CharacterStats, item: Item, add = true) {
  applyItemToStats(stats, item, add)
}

function applyCharacterItems(character: Character, stats: CharacterStats) {
  for (const key in character.items) {
    if (Object.prototype.hasOwnProperty.call(character.items, key)) {
      const itemName = character.items[key as keyof Character['items']];
      if (itemName) {
        applyItemToStats(stats, ITEMS[itemName]);
      }
    }
  }
}

function applyItemToStats(stats: CharacterStats, item: Item, add = true) {
  if (item.type === 'consumable' || item.type === 'quest') return

  for (const k in item.statChanges) {
    if (Object.prototype.hasOwnProperty.call(item.statChanges, k)) {
      const key = k as keyof ItemWithStatChange['statChanges'];
      const change = item.statChanges[key];
      if (!change) continue

      applyStatChange(stats, key, change, add);
    }
  }
}

function applyStatChange(stats: CharacterStats, key: keyof CharacterStats, change: number | NumberRange, add: boolean) {
  if (key === 'maxHealth') {
    const healthPercentage = stats.health / stats.maxHealth;
    stats.maxHealth += (add ? change : -change) as number;
    stats.health = stats.maxHealth * healthPercentage;
  } else if (key === 'maxStamina') {
    const staminaPercentage = stats.stamina / stats.maxStamina;
    stats.maxStamina += (add ? change : -change) as number;
    stats.stamina = stats.maxStamina * staminaPercentage;

  } else {
    switch (typeof change) {
      case 'number':
        if (add) {
          (stats[key] as number) += change;
        } else {
          (stats[key] as number) -= change;
        }

        break;
      case 'object':
        const old = (stats[key] as NumberRange);
        if (add) {
          (stats[key] as NumberRange) = NumberRange(old.min + change.min, old.max + change.max);
        } else {
          (stats[key] as NumberRange) = NumberRange(old.min - change.min, old.max - change.max);
        }
        break;
    }
  }
}
export interface Difficulty {
  playerTimeToDodge: number,
  aiDodgeChance: number,
  aiBlockChance: number
  aiUseDodge: number
  playerTimeToBlock: number
}
export function checkAiDifficulty(playerStats: CharacterStats, aiStats: CharacterStats): Difficulty {
  const aiAttackSpeed = (1000 / aiStats.attackSpeed);
  return {
    playerTimeToDodge: (aiAttackSpeed * ATTACK_ACTIVE_TIME) - (playerStats.dodgeSpeed * 1000),
    playerTimeToBlock: (aiAttackSpeed * ATTACK_ACTIVE_TIME) - (BLOCK_TIME * 1000),
    aiUseDodge: aiStats.aiUseDodge * 100,
    aiDodgeChance: aiStats.aiDodgeChance * 100,
    aiBlockChance: aiStats.aiBlockChance * 100,
  }
}
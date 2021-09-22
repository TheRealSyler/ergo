import { ATTACK_ACTIVE_TIME } from '../animation/attackState';
import { NumberRange } from '../utils';
import { Character, Skills, SKILLS } from './character';
import { ConsumableItem, Item, ITEMS, ItemWithStatChange } from './items';

export interface CharacterStats {
  /** The time the ai does nothing/waits for the player to attack. */
  aiTimeToAttack: NumberRange
  aiDodgeChance: number
  /**The attack animation speed. */
  attackSpeed: number
  /**The time it takes to go from idle to dodge state. */
  dodgeSpeed: number
  /** The hit animation speed. */
  hitTime: number

  /**Stamina Regeneration Per second */
  staminaRegenRate: number

  attackStaminaCost: number
  dodgeStaminaCost: number

  damage: NumberRange

  maxHealth: number
  health: number
  maxStamina: number
  stamina: number
}

export type CharacterClass = 'base' | 'awd' | 'awd2' | 'awd3';

const BASE_STATS: CharacterStats = {
  damage: NumberRange(3, 7),
  attackSpeed: 1,
  maxHealth: 25,
  maxStamina: 10,
  dodgeSpeed: 0.2,
  aiDodgeChance: 0.3,
  aiTimeToAttack: NumberRange(0.5, 1.5),
  hitTime: 1.5,
  staminaRegenRate: 5,
  attackStaminaCost: 5,
  dodgeStaminaCost: 1,
  health: 25,
  stamina: 25,
}

function getCharacterBaseStats(charClass: CharacterClass): CharacterStats {
  const baseCopy = JSON.parse(JSON.stringify(BASE_STATS)) as CharacterStats;
  switch (charClass) {
    case 'base':
      return baseCopy
    case 'awd':
      baseCopy.maxHealth = 50
      return baseCopy
    case 'awd2':
      baseCopy.maxHealth = 100
      baseCopy.aiTimeToAttack = NumberRange(0.2, 1.3)
      baseCopy.attackSpeed = 1.1
      baseCopy.maxStamina = 20
      baseCopy.damage = NumberRange(20, 30)
      return baseCopy
    case 'awd3':
      baseCopy.maxHealth = 200
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

  applyCharacterSkills(character, stats);

  stats.health = stats.maxHealth
  stats.stamina = stats.maxStamina

  return stats
}

function applyCharacterSkills(character: Character, stats: CharacterStats) {
  for (const k in character.skills) {
    if (Object.prototype.hasOwnProperty.call(character.skills, k)) {
      const key = k as keyof typeof character.skills;
      const skillName = character.skills[key];
      if (skillName) applySkill(key, stats);
    }
  }
}

function applySkill(key: Skills, stats: CharacterStats) {
  const skill = SKILLS[key];
  for (const j in skill) {
    if (Object.prototype.hasOwnProperty.call(skill, j)) {
      const jKey = j as keyof typeof skill;
      const change = skill[jKey];
      if (change) {
        applyStatChange(stats, jKey, change, true);
      }
    }
  }
}

export function useConsumable(stats: CharacterStats, item: ConsumableItem) {
  const health = item.effect.health;
  if (health === 'Full') {
    stats.health = stats.maxHealth;
  } else if (health) {
    stats.health = Math.min(stats.maxHealth, stats.health + health);
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
}
export function checkAiDifficulty(playerStats: CharacterStats, aiStats: CharacterStats): Difficulty {
  const aiAttackSpeed = (1000 / aiStats.attackSpeed);
  return {
    playerTimeToDodge: (aiAttackSpeed * ATTACK_ACTIVE_TIME) - (playerStats.dodgeSpeed * 1000),
    aiDodgeChance: aiStats.aiDodgeChance * 100,
  }
}
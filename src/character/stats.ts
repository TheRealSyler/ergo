import { NumberRange } from '../utils';
import { Character } from './character';
import { Item, ITEMS } from './items';

export interface CharacterStats {
  /** The time the ai does nothing/waits for the player to attack. */
  aiTimeToAttack: NumberRange
  /**The time it takes for the ai to react to the player attack. */
  aiDodgeReactionTime: NumberRange
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
  aiDodgeReactionTime: NumberRange(0.1, 0.8),
  aiTimeToAttack: NumberRange(0.5, 1.5),
  hitTime: 1.5,
  staminaRegenRate: 5,
  attackStaminaCost: 5,
  dodgeStaminaCost: 1,
  health: 25,
  stamina: 25,
}

export function createStats(character: Character): CharacterStats {
  const stats = getCharacterBaseStats(character.class);

  applyStats(character, stats);

  stats.health = stats.maxHealth
  stats.stamina = stats.maxStamina

  return stats
}

export function updateStatsWithItem(stats: CharacterStats, item: Item, add = true) {
  applyItemToStats(stats, item, add)
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

function applyStats(character: Character, stats: CharacterStats) {
  for (const key in character.items) {
    if (Object.prototype.hasOwnProperty.call(character.items, key)) {
      const itemName = character.items[key as keyof Character['items']];
      if (itemName) {
        const itemSlot = ITEMS[key as keyof Character['items']];
        applyItemToStats(stats, itemSlot[itemName as keyof typeof itemSlot]);
      }
    }
  }
}

function applyItemToStats(stats: CharacterStats, item: Item, add = true) {
  for (const k in item.statChanges) {
    if (Object.prototype.hasOwnProperty.call(item.statChanges, k)) {
      const key = k as keyof Item['statChanges'];
      const change = item.statChanges[key];
      if (!change) continue

      if (key === 'maxHealth') {
        const healthPercentage = stats.health / stats.maxHealth
        stats.maxHealth += (add ? change : -change) as number
        stats.health = stats.maxHealth * healthPercentage
      } else if (key === 'maxStamina') {
        const staminaPercentage = stats.stamina / stats.maxStamina
        stats.maxStamina += (add ? change : -change) as number
        stats.stamina = stats.maxStamina * staminaPercentage

      } else {
        switch (typeof change) {
          case 'number':
            if (add) {
              (stats[key] as number) += change
            } else {
              (stats[key] as number) -= change
            }

            break;
          case 'object':
            const old = (stats[key] as NumberRange);
            if (add) {
              (stats[key] as NumberRange) = NumberRange(old.min + change.min, old.max + change.max)
            } else {
              (stats[key] as NumberRange) = NumberRange(old.min - change.min, old.max - change.max)
            }
            break;
        }
      }
    }
  }
}
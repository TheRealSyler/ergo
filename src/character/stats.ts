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

export type CharacterClass = 'base' | 'awd';

const BASE_STATS: CharacterStats = {
  aiDodgeReactionTime: new NumberRange(0.1, 0.8),
  aiTimeToAttack: new NumberRange(0.5, 1.5),
  attackSpeed: 1,
  dodgeSpeed: 0.2,
  hitTime: 1.5,
  staminaRegenRate: 1,
  attackStaminaCost: 5,
  dodgeStaminaCost: 1,
  damage: new NumberRange(3, 7),
  health: 25,
  maxHealth: 25,
  maxStamina: 10,
  stamina: 25,
}

export function createStats(character: Character): CharacterStats {
  const stats = getCharacterBaseStats(character.class);

  applyStats(character, stats);

  stats.health = stats.maxHealth
  stats.stamina = stats.maxStamina

  return stats
}

function getCharacterBaseStats(charClass: CharacterClass): CharacterStats {
  const baseCopy = JSON.parse(JSON.stringify(BASE_STATS)) as CharacterStats;
  switch (charClass) {
    case 'base':
      return baseCopy
    case 'awd':
      baseCopy.maxHealth = 50
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

function applyItemToStats(stats: CharacterStats, item: Item) {
  for (const k in item.statChanges) {
    if (Object.prototype.hasOwnProperty.call(item.statChanges, k)) {
      const key = k as keyof Item['statChanges'];
      const change = item.statChanges[key];

      switch (typeof change) {
        case 'number':
          (stats[key] as number) += change

          break;
        case 'object':
          const old = (stats[key] as NumberRange);
          (stats[key] as NumberRange) = new NumberRange(old.min + change.min, old.max + change.max)
          break;
      }
    }
  }
}
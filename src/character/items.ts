import { NumberRange } from '../utils'
import { CharacterStats } from './stats'

type StatChanges = Partial<Omit<CharacterStats, 'health' | 'stamina' | 'aiDodgeReactionTime' | 'aiTimeToAttack'>>;

type NormalItemType = 'armor' | 'gloves';
type WeaponType = 'weapon'
type ItemType = NormalItemType | WeaponType
interface WeaponItem {
  type: WeaponType
  statChanges: StatChanges
  weaponHands: 'single' | 'double'
}

interface NormalItem {
  type: NormalItemType
  statChanges: StatChanges
}
export type Item = NormalItem | WeaponItem
export type WeaponNames = 'BasicSword' | 'SuperSword';
export type GloveNames = 'BasicGloves' | 'SuperGloves';
export type ArmorNames = 'BasicArmor';

export type ItemName = GloveNames | WeaponNames | ArmorNames

export interface Items {
  weapon: WeaponNames,
  gloves: GloveNames,
  armor: ArmorNames
}

export const ITEM_TYPES: { [key in ItemType]: any } = {
  armor: true,
  gloves: true,
  weapon: true,
}

export const ITEMS: { [key in ItemName]: Item } = {
  BasicArmor: {
    type: 'armor',
    statChanges: {
      maxHealth: 100,
      maxStamina: 10,
      dodgeStaminaCost: 1,
      staminaRegenRate: -2,
    },
  },
  BasicSword: {
    type: 'weapon',
    statChanges: {
      damage: NumberRange(10, 15)
    },
    weaponHands: 'single'
  },
  SuperSword: {
    type: 'weapon',
    statChanges: {
      damage: NumberRange(20, 25)
    },
    weaponHands: 'single'
  },
  BasicGloves: {
    type: 'gloves',
    statChanges: {
      damage: NumberRange(1, 1),
      maxHealth: 7
    }
  },
  SuperGloves: {
    type: 'gloves',
    statChanges: {
      maxHealth: 40,
      dodgeSpeed: -0.1
    }
  }
}

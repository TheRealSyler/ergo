import { NumberRange } from '../utils'
import { CharacterStats } from './stats'

type StatChanges = Partial<Omit<CharacterStats, 'health' | 'stamina' | 'aiDodgeReactionTime' | 'aiTimeToAttack'>>;

interface WeaponItem {
  description: string
  statChanges: StatChanges
  weaponHands: 'single' | 'double'
}

interface NormalItem {
  description: string
  statChanges: StatChanges
}
export type Item = NormalItem | WeaponItem
export type WeaponNames = 'BasicSword' | 'SuperSword';
export type GloveNames = 'BasicGloves' | 'SuperGloves';
export type ArmorNames = 'BasicArmor';

export type ItemName = GloveNames | WeaponNames | ArmorNames


const gloves: Record<Items['gloves'], NormalItem> = {
  BasicGloves: {
    description: '',
    statChanges: {
      damage: NumberRange(1, 1),
      maxHealth: 7
    }
  },
  SuperGloves: {
    description: '',
    statChanges: {
      maxHealth: 40,
      dodgeSpeed: -0.1
    }
  }
}
const weapon: Record<Items['weapon'], WeaponItem> = {
  BasicSword: {
    description: 'awd',
    statChanges: {
      damage: NumberRange(10, 15)
    },
    weaponHands: 'single'
  },
  SuperSword: {
    description: 'awd',
    statChanges: {
      damage: NumberRange(20, 25)
    },
    weaponHands: 'single'
  }
}
const armor: Record<Items['armor'], NormalItem> = {
  BasicArmor: {
    description: 'awd',
    statChanges: {
      staminaRegenRate: -2,
      maxStamina: 10,
      maxHealth: 100,
    },
  },

}

export interface Items {
  weapon: WeaponNames,
  gloves: GloveNames,
  armor: ArmorNames
}

export const ITEMS = {
  gloves: gloves,
  weapon: weapon,
  armor: armor
}

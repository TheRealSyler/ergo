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
export type WeaponItems = 'BasicSword';
export type GloveItems = 'BasicGloves' | 'SuperGloves';

export type ItemName = GloveItems | WeaponItems


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
      damage: NumberRange(20, 22)
    },
    weaponHands: 'single'
  }
}

export interface Items {
  weapon: WeaponItems,
  gloves: GloveItems,
}

export const ITEMS = {
  gloves: gloves,
  weapon: weapon
}

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
export type WeaponItems = 'AWD';
export type GloveItems = 'BasicGloves';

export type ItemName = GloveItems | WeaponItems


const gloves: Record<Items['gloves'], NormalItem> = {
  BasicGloves: {
    description: '',
    statChanges: {
      damage: new NumberRange(1, 1),
      maxHealth: 7
    }
  }
}
const weapon: Record<Items['weapon'], WeaponItem> = {
  AWD: {
    description: 'awd',
    statChanges: {
      maxHealth: 200
    },
    weaponHands: 'double'
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

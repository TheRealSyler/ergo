import { CharacterClass, CharacterStats } from './stats';
import { Items, } from './items';
import { NumberRange } from '../utils';

export interface Character {
  items: Partial<Items>
  class: CharacterClass
  money: number,
  skills: CharacterSkills,
}

export function createCharacter(char?: Partial<Character>): Character {
  return { items: {}, class: 'base', money: 0, skills: {}, ...char }
}

export type Skills = 'Strength' | 'Evasion' | 'Strength II' | 'Evasion II'

export type CharacterSkills = { [key in Skills]?: true }

export const SKILLS: Record<Skills, Partial<CharacterStats>> = {
  Evasion: { aiDodgeChance: 0.05, dodgeSpeed: 0.05 },
  Strength: { damage: NumberRange(2, 4), maxHealth: 5 },
  "Evasion II": { aiDodgeChance: 0.25, dodgeSpeed: 0.05 },
  "Strength II": { damage: NumberRange(4, 8), maxHealth: 15 }
}

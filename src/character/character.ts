import { CharacterClass } from './stats';
import { Items, } from './items';
import { CharacterSkills } from './skills';

export interface Character {
  items: Partial<Items>
  class: CharacterClass
  money: number
  level: number
  exp: number
  skills: CharacterSkills
  skillPoints: number
}

export function createCharacter(char?: Partial<Character>): Character {
  return { items: {}, class: 'base', skills: {}, skillPoints: 0, money: 0, exp: 0, level: 10, ...char }
}

export function expToNextLevel(level: number) {
  const x = level + 1
  return BaseExponent(x, 15, 2)
}
export function expGainAtLevel(level: number) {
  const x = level + 1
  return BaseExponent(x, 15, 1.4)
}
// TODO find better name.
export function BaseExponent(x: number, a: number, b: number) {
  return Math.round(a * (x ** b))
}
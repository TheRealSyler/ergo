import { CharacterClass } from './stats';
import { Items, } from './items';
import { CharacterSkills } from './skills';

export interface Character {
  items: Partial<Items>
  class: CharacterClass
  money: number,
  skills: CharacterSkills,
}

export function createCharacter(char?: Partial<Character>): Character {
  return { items: {}, class: 'base', money: 0, skills: {}, ...char }
}



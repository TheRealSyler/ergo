import { CharacterClass } from './stats';
import { Items, } from './items';

export interface Character {
  items: Partial<Items>
  class: CharacterClass
  money: number
}
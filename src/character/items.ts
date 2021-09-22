import { NumberRange } from '../utils'
import { CharacterStats } from './stats'

type StatChanges = Partial<Omit<CharacterStats, 'health' | 'stamina' | 'aiDodgeReactionTime' | 'aiTimeToAttack'>>;

type QuestType = 'quest';
type ConsumableType = 'consumable';
type NormalItemType = 'armor' | 'gloves';
type WeaponType = 'weapon'
type ItemType = NormalItemType | WeaponType | ConsumableType | QuestType
interface WeaponItem {
  type: WeaponType
  statChanges: StatChanges
  weaponHands: 'single' | 'double'
}
interface NormalItem {
  type: NormalItemType
  statChanges: StatChanges
}

export type ConsumableEffect = {
  health?: number | 'Full';
};

export interface ConsumableItem {
  type: ConsumableType
  effect: ConsumableEffect
}
interface QuestItem {
  type: QuestType
}
export type ItemWithStatChange = NormalItem | WeaponItem
export type Item = ItemWithStatChange | ConsumableItem | QuestItem
export type WeaponNames = 'BasicSword' | 'SuperSword';
export type GloveNames = 'BasicGloves' | 'SuperGloves';
export type ArmorNames = 'BasicArmor';
export type QuestItemNames = 'BanditBounty';
export type ConsumableNames = 'Bandage';

export type EquipAbleItems = GloveNames | WeaponNames | ArmorNames;

export type ItemName = EquipAbleItems | QuestItemNames | ConsumableNames;

export interface Items {
  weapon: WeaponNames,
  gloves: GloveNames,
  armor: ArmorNames
}

export const ITEM_TYPES: { [key in ItemType]: any } = {
  armor: true,
  gloves: true,
  weapon: true,
  consumable: true,
  quest: true,
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
  },
  Bandage: {
    type: 'consumable',
    effect: {
      health: 10
    }
  },
  BanditBounty: {
    type: 'quest'
  }
}

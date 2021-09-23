import { CharacterStats } from './stats';
import { NumberRange } from '../utils';


export type Skills = 'Strength' | 'Evasion' | 'Strength II' | 'Evasion II' | 'Speed' | 'Endurance';

export type CharacterSkills = {
  [key in Skills]?: true;
};

export const SKILLS: Record<Skills, Partial<CharacterStats>> = {
  Evasion: { aiDodgeChance: 0.05, dodgeSpeed: 0.05 },
  Strength: { damage: NumberRange(2, 4), maxHealth: 5 },
  "Evasion II": { aiDodgeChance: 0.25, dodgeSpeed: 0.05 },
  "Strength II": { damage: NumberRange(4, 8), maxHealth: 15 },
  Speed: { dodgeSpeed: 0.05, attackSpeed: 0.1 },
  Endurance: { maxStamina: 20, staminaRegenRate: 5 }
};

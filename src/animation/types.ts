import { AnimationClip, AnimationAction } from 'three';
export type AttackAnimations = 'attack_right' | 'attack_left' | 'attack_down' | 'attack_up'
export type BlockAnimations = 'block_right' | 'block_left' | 'block_down' | 'block_up'
export type DodgeAnimations = 'dodge_left' | 'dodge_right'
export type AnimationTypes = AttackAnimations | DodgeAnimations | 'idle' | 'hit' | 'death' | 'victory' | BlockAnimations | 'stunned'

export type Animations<T extends string> = Record<T, {
  clip: AnimationClip;
  action: AnimationAction;
}>
import { AnimationClip, AnimationAction } from 'three';
export type AttackAnimations = 'attack_right' | 'attack_left' | 'attack_down' | 'attack_up'
export type DodgeAnimations = 'dodge_left' | 'dodge_right' | 'dodge_down'
export type AnimationTypes = AttackAnimations | DodgeAnimations | 'idle'

export type Animations<T extends string> = {
  [key in T]?: {
    clip: AnimationClip;
    action: AnimationAction;
  };
};

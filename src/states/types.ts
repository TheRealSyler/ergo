import { AnimationClip, AnimationAction } from 'three';

export type AnimationTypes = 'attack_right' | 'attack_left' | 'dodge_left' | 'dodge_right' | 'dodge_down' | 'idle'

export type Animations<T extends string> = {
  [key in T]?: {
    clip: AnimationClip;
    action: AnimationAction;
  };
};

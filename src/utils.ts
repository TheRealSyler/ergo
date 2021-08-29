import { AnimationAction } from 'three';
import { Animations } from './states/types';

export function getAnimAction<T extends string>(animations: Animations<T>, name: T): AnimationAction {
  if (animations[name]) {
    return animations[name]!.action;
  }
  error(`Failed to get animation action: ${name}.`, 'getAnimAction');
  return undefined as any as AnimationAction;
}

export function error(message: string, tip?: string) {
  console.error(`${tip ? `[${tip}] ` : ''}${message}`)
}
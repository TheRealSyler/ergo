import { AnimationAction } from 'three';
import { Animations } from './animation/types';

export function getAnimAction<T extends string>(animations: Animations<T>, name: T): AnimationAction {
  if (animations[name]) {
    return animations[name]!.action;
  }
  error(`Failed to get animation action: ${name}.`, getAnimAction.name);
  return undefined as any as AnimationAction;
}

export function error(message: string, tip?: string) {
  console.error(`${tip ? `[${tip}] ` : ''}${message}`)
}

export function chooseRandomArrayEl<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class NumberRange {
  constructor(public min: number, public max: number) {
    if (min > max) {
      error(`min value (${min}) is more than max value (${max}).`, NumberRange.name)
    }
  }
}

export function randomInRange(range: NumberRange) {
  return range.min + (Math.random() * (range.max - range.min))
}

export function toPx(t: string | number) {
  return `${t}px`
}
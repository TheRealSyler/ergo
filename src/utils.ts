import { AnimationAction, Group, LoadingManager, Mesh, Object3D, PointLight } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { degToRad } from 'three/src/math/MathUtils';
import { Animations } from './animation/types';
import { DoorDir } from './dungeon/dungeonRoom';

export interface Position3 {
  x: number,
  y: number,
  z: number
}

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
export interface NumberRange {
  min: number
  max: number
}

export function NumberRange(min: number, max: number) {
  if (min > max) {
    error(`min value (${min}) is more than max value (${max}).`, NumberRange.name)
  }
  return { min, max }
}

export function randomInRange(range: NumberRange) {
  return range.min + (Math.random() * (range.max - range.min))
}

export function toPx(t: string | number) {
  return `${t}px`
}

export function getGLTFLoader(manager?: LoadingManager) {
  const loader = new GLTFLoader(manager);
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/');
  loader.setDRACOLoader(dracoLoader);
  return loader;
}

export function addModelWithCollision(gltf: GLTF, collisionObjects: Object3D[], group: Group) {
  const objects: Object3D[] = [];
  gltf.scene.traverse((o) => {
    if ((o as Mesh).isMesh) {
      if (o.name.startsWith('collision_')) {
        collisionObjects.push(o);
        o.visible = false;
      }
      objects.push(o); // DO NOT directly add to group, it will mess with the traverse function.
    } else if ((o as PointLight).isLight) {
      objects.push(o);
    }

  });

  group.add(...objects);

}

export function dirToRadians(dir: DoorDir) {
  switch (dir) {
    case 'north':
      return 0
    case 'east':
      return degToRad(90)
    case 'west':
      return degToRad(-90)
    case 'south':
      return degToRad(180)
  }
}
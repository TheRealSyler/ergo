import { AnimationAction, Group, LoadingManager, MathUtils, Mesh, Object3D, PointLight } from 'three'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'
import type { Animations } from './animation/types'
import type { DungeonDir } from './dungeon/dungeon'

export interface Position3 {
  x: number,
  y: number,
  z: number
}

export function getAnimAction<T extends string>(animations: Animations<T>, name: T): AnimationAction {
  if (animations[name]) {
    return animations[name]!.action
  }
  error(`Failed to get animation action: ${name}.`, getAnimAction.name)
  return undefined as never as AnimationAction
}

export function error(message: string, tip?: string) {
  console.error(`${tip ? `[${tip}] ` : ''}${message}`)
}

export function chooseRandomArrayEl<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
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

export function checkChance(chance: number): boolean {
  return Math.random() < chance
}

export function toPx(t: string | number) {
  return `${t}px`
}

export function getGLTFLoader(manager?: LoadingManager) {
  const loader = new GLTFLoader(manager)
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/a79f0788dced39e925d001a9566931f03d984951/examples/jsm/libs/draco/')
  loader.setDRACOLoader(dracoLoader)
  return loader
}

export function addModelWithCollision(gltf: GLTF, collisionObjects: Object3D[], group: Group) {
  const objects: Object3D[] = []
  gltf.scene.traverse((o) => {
    if ((o as Mesh).isMesh) {
      if (o.name.startsWith('collision_')) {
        collisionObjects.push(o)
        o.visible = false
      }
      objects.push(o) // DO NOT directly add to group, it will mess with the traverse function.
    } else if ((o as PointLight).isLight) {
      objects.push(o)
    }

  })

  group.add(...objects)

}

export function dirToRadians(dir: DungeonDir) {
  switch (dir) {
    case 'north':
      return 0
    case 'east':
      return MathUtils.degToRad(90)
    case 'west':
      return MathUtils.degToRad(-90)
    case 'south':
      return MathUtils.degToRad(180)
  }
}

export async function wait(time: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(res, time)
  })
}

export function toFixedIfNotZero(n: number, fractionDigits: number) {
  return n.toFixed(fractionDigits).replace(/\.0$/, '')
}

export function TextUI(text: string) {
  return text.replace(/([A-Z])/g, ' $1')
}
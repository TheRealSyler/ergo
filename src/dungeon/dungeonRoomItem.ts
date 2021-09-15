import { Group, Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { addModelWithCollision } from '../utils';
import chest from '../assets/chest.glb'

export type RoomItemNames = 'chest'

export interface RoomItemAsset {
  scene: Group,
  collision: Object3D
}

export async function loadRoomItem(loader: GLTFLoader, name: RoomItemNames): Promise<RoomItemAsset> {
  const group = new Group()
  switch (name) {
    case 'chest':
      const collisionObjects: Object3D[] = []
      addModelWithCollision(await loader.loadAsync(chest), collisionObjects, group)
      return {
        collision: collisionObjects[0],
        scene: group
      }
  }
}
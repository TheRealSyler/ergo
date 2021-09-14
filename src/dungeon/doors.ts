import { Group, Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { addModelWithCollision } from '../utils';
import door from '../assets/doors/basic_door.glb'

export type RoomDoorName = 'basic'

export interface RoomDoorAsset {
  scene: Group,
  collision: Object3D
}

export async function loadRoomDoor(loader: GLTFLoader, name: RoomDoorName): Promise<RoomDoorAsset> {
  const group = new Group()
  switch (name) {
    case 'basic':
      const collisionObjects: Object3D[] = []
      addModelWithCollision(await loader.loadAsync(door), collisionObjects, group)
      return {
        collision: collisionObjects[0],
        scene: group
      }
  }
}
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { addModelWithCollision } from '../utils';
import chest from '../assets/chest.glb'

export type RoomItemNames = 'chest' | 'enemy'

export interface RoomItemAsset {
  scene: Group,
  collision: Object3D
}

export async function loadRoomItem(loader: GLTFLoader, name: RoomItemNames): Promise<RoomItemAsset> {
  const group = new Group()
  switch (name) {
    case 'enemy':
      {
        await loader.loadAsync(chest) // TODO Replace with actual asset
        const collisionObjects: Object3D[] = []
        const mesh = new Mesh(new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial({ color: 0xffffffff }));
        mesh.translateY(0.5)
        collisionObjects.push(mesh)
        group.add(mesh)
        return {
          collision: collisionObjects[0],
          scene: group
        }
      }

    case 'chest':
      {
        const collisionObjects: Object3D[] = []
        addModelWithCollision(await loader.loadAsync(chest), collisionObjects, group)
        return {
          collision: collisionObjects[0],
          scene: group
        }
      }
  }
}
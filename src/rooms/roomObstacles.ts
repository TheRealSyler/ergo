import { Group, LoadingManager, Object3D } from 'three';
import { getGLTFLoader, addModelWithCollision } from '../utils';
import test from '../assets/room_obstacle.glb'

export interface Obstacle {
  obj: Group,
  collisions: Object3D[]
}

export type ObstacleName = 'test'

export async function loadObstacle(obstacle: ObstacleName, manager?: LoadingManager): Promise<Obstacle> {
  const group = new Group()
  switch (obstacle) {
    case 'test':
      {
        const collisionObjects: Object3D[] = []
        const loader = getGLTFLoader(manager)


        addModelWithCollision(await loader.loadAsync(test), collisionObjects, group)
        return {
          obj: group,
          collisions: collisionObjects
        }
      }

  }
}
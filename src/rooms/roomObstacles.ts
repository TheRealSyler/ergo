import { Group, Object3D } from 'three';
import { addModelWithCollision, dirToRadians } from '../utils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DoorDir } from '../dungeon/dungeonRoom';
import { radToDeg } from 'three/src/math/MathUtils';

import test from '../assets/room_obstacle.glb'
import test2 from '../assets/room_obstacle2.glb'
export interface Obstacle {
  obj: Group,
  collisions: Object3D[]
}

type ObstacleName = 'test' | 'test2'
export interface ObstacleInfo {
  name: ObstacleName,
  dir: DoorDir
}
export async function loadObstacle(obstacle: ObstacleInfo, loader: GLTFLoader): Promise<Obstacle> {
  const group = new Group()
  switch (obstacle.name) {
    case 'test':
      {
        const collisionObjects: Object3D[] = []

        addModelWithCollision(await loader.loadAsync(test), collisionObjects, group)
        console.log(radToDeg(dirToRadians(obstacle.dir)))
        group.traverse((o) => o.rotateY(dirToRadians(obstacle.dir)))

        return {
          obj: group,
          collisions: collisionObjects
        }
      }
    case 'test2':
      {
        const collisionObjects: Object3D[] = []

        addModelWithCollision(await loader.loadAsync(test2), collisionObjects, group)
        console.log((dirToRadians(obstacle.dir)))
        group.traverse((o) => o.rotateY(dirToRadians(obstacle.dir)))

        return {
          obj: group,
          collisions: collisionObjects
        }
      }

  }
}
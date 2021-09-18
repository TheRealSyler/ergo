import { EquirectangularReflectionMapping, Group, LoadingManager, Object3D, sRGBEncoding, Texture, TextureLoader } from 'three';

import test from '../assets/rooms/test.glb'
import test2 from '../assets/rooms/room_test2.glb'
import test3 from '../assets/rooms/room_test3.glb'
import awd from '../assets/rooms/awd.jpg'
import { addModelWithCollision } from '../utils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export type RoomNames = 'basic' | 'test' | 'test3';

export interface Room {
  scene: Group,
  background: Texture
  collisions: Object3D[]
}

export async function loadRoom(room: RoomNames, manager: LoadingManager, gltfLoader: GLTFLoader): Promise<Room> {
  const group = new Group()
  switch (room) {
    case 'basic':
      {
        const collisionObjects: Object3D[] = []

        // let light = new DirectionalLight(0xFFFFFF, 0.4);
        // light.position.set(-10, 10, 0);
        // light.target.position.set(0, 0, 0);
        // light.castShadow = true;
        // group.add(light);



        addModelWithCollision(await gltfLoader.loadAsync(test2), collisionObjects, group)
        const textureLoader = new TextureLoader(manager);

        const textureEquirectangular = await textureLoader.loadAsync(awd);
        textureEquirectangular.mapping = EquirectangularReflectionMapping;
        textureEquirectangular.encoding = sRGBEncoding;

        return {
          scene: group,
          background: textureEquirectangular,
          collisions: collisionObjects
        }
      }
    case 'test':
      {
        const collisionObjects: Object3D[] = []

        addModelWithCollision(await gltfLoader.loadAsync(test), collisionObjects, group)

        const textureLoader = new TextureLoader(manager);

        const textureEquirectangular = await textureLoader.loadAsync(awd);
        textureEquirectangular.mapping = EquirectangularReflectionMapping;
        textureEquirectangular.encoding = sRGBEncoding;

        // let light = new DirectionalLight(0xFFFFFF, 0.4);
        // light.position.set(-5, 5, 0);
        // light.target.position.set(0, 0, 0);
        // light.castShadow = true;
        // light.shadow.mapSize.width = 1024 * 4
        // light.shadow.mapSize.height = 1024 * 4
        // light.shadow.radius = 2
        // group.add(light);


        return {
          scene: group,
          background: textureEquirectangular,
          collisions: collisionObjects
        }
      }
    case 'test3':
      {
        const collisionObjects: Object3D[] = []

        addModelWithCollision(await gltfLoader.loadAsync(test3), collisionObjects, group)

        const textureLoader = new TextureLoader(manager);

        const textureEquirectangular = await textureLoader.loadAsync(awd);
        textureEquirectangular.mapping = EquirectangularReflectionMapping;
        textureEquirectangular.encoding = sRGBEncoding;

        // let light = new DirectionalLight(0xFFFFFF, 0.4);
        // light.position.set(-5, 5, 0);
        // light.target.position.set(0, 0, 0);
        // light.castShadow = true;
        // light.shadow.mapSize.width = 1024 * 4
        // light.shadow.mapSize.height = 1024 * 4
        // light.shadow.radius = 2
        // group.add(light);


        return {
          scene: group,
          background: textureEquirectangular,
          collisions: collisionObjects
        }
      }
  }


}

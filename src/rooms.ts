import { AmbientLight, DirectionalLight, EquirectangularReflectionMapping, Group, LoadingManager, Mesh, MeshStandardMaterial, Object3D, PlaneGeometry, PointLight, sRGBEncoding, Texture, TextureLoader } from 'three';
import { degToRad } from 'three/src/math/MathUtils';

import test from './assets/test.glb'
import awd from './assets/awd.jpg'
import { getGLTFLoader } from './utils';

export type RoomNames = 'basic' | 'test';

export interface Room {
  scene: Group,
  background: Texture
  collisions?: Object3D[]
}

export function loadRoom(room: RoomNames, manager: LoadingManager): Room {
  const group = new Group()
  switch (room) {
    case 'basic':
      {
        let light = new DirectionalLight(0xFFFFFF, 0.4);
        light.position.set(-10, 10, 0);
        light.target.position.set(0, 0, 0);
        // light.castShadow = true;
        group.add(light);

        light = new AmbientLight(0xFFFFFF, 1) as any;
        group.add(light);

        const plane = new Mesh(
          new PlaneGeometry(40, 40, 1, 1),
          new MeshStandardMaterial({
            color: 0x808080,
          }));
        // plane.receiveShadow = true
        plane.rotation.x = degToRad(-90);
        group.add(plane);
        const textureLoader = new TextureLoader(manager);

        const textureEquirectangular = textureLoader.load(awd);
        textureEquirectangular.mapping = EquirectangularReflectionMapping;
        textureEquirectangular.encoding = sRGBEncoding;

        return {
          scene: group,
          background: textureEquirectangular
        }
      }
    case 'test':
      {
        const collisionObjects: Object3D[] = []
        const objects: Object3D[] = []
        const loader = getGLTFLoader(manager)

        loader.load(test, (gltf) => {
          gltf.scene.traverse((o) => {
            if ((o as Mesh).isMesh) {
              if (o.name.endsWith('_collision')) {
                collisionObjects.push(o)
                o.visible = false
              }
              objects.push(o) // DO NOT directly add to group, it will mess with the traverse function.
            } else if ((o as PointLight).isLight) {
              objects.push(o)
            }

          })

          group.add(...objects)
        })
        const textureLoader = new TextureLoader(manager);

        const textureEquirectangular = textureLoader.load(awd);
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

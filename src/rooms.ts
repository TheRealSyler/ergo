import { AmbientLight, DirectionalLight, EquirectangularReflectionMapping, Group, LoadingManager, Mesh, MeshStandardMaterial, PlaneGeometry, sRGBEncoding, Texture, TextureLoader } from 'three';
import { degToRad } from 'three/src/math/MathUtils';

export type RoomNames = 'basic' | 'test';

export interface Room {
  scene: Group,
  background?: Texture
}
import awd from './assets/awd.jpg'

export function getRoom(stage: RoomNames, manager: LoadingManager): Room {
  const group = new Group()
  switch (stage) {
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
        return {
          scene: group
        }
      }
    case 'test':
      {
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
        const plane = new Mesh(
          new PlaneGeometry(40, 40, 1, 1),
          new MeshStandardMaterial({
            color: 0x608080,
          }));

        plane.rotation.x = degToRad(-90);
        // plane.receiveShadow = true
        group.add(plane);
        return {
          scene: group,
          background: textureEquirectangular
        }
      }
  }


}

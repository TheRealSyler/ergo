import { AmbientLight, DirectionalLight, EquirectangularReflectionMapping, Group, LoadingManager, Mesh, MeshStandardMaterial, PlaneGeometry, sRGBEncoding, Texture, TextureLoader } from 'three';
import { degToRad } from 'three/src/math/MathUtils';

export type StageNames = 'basic' | 'test';

export interface Stage {
  scene: Group,
  background?: Texture
}
import awd from '../assets/awd.jpg'

export function getStage(stage: StageNames, manager: LoadingManager): Stage {
  const group = new Group()
  switch (stage) {
    case 'basic':
      {
        let light = new DirectionalLight(0xFFFFFF, 0.4);
        light.position.set(-10, 10, 10);
        light.target.position.set(0, 0, 0);

        group.add(light);

        light = new AmbientLight(0xFFFFFF, 1) as any;
        group.add(light);

        const plane = new Mesh(
          new PlaneGeometry(40, 40, 1, 1),
          new MeshStandardMaterial({
            color: 0x808080,
          }));

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

        const plane = new Mesh(
          new PlaneGeometry(40, 40, 1, 1),
          new MeshStandardMaterial({
            color: 0x608080,

          }));

        plane.rotation.x = degToRad(-90);

        group.add(plane);
        return {
          scene: group,
          background: textureEquirectangular
        }
      }
  }


}

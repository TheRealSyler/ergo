import { Clock, EquirectangularReflectionMapping, LoadingManager, Object3D, PerspectiveCamera, Quaternion, sRGBEncoding, TextureLoader, Vector3 } from 'three';
import { Renderer } from '../renderer';
import { LoaderUI } from '../ui/loaderUI';
import { error, getGLTFLoader } from '../utils';
import map from '../assets/campaign/campaign_map.glb'
import awd from '../assets/rooms/awd.jpg'

import { MAIN_UI_ELEMENT } from '../ui/ui';
import { lerp } from 'three/src/math/MathUtils';

type CameraName = 'camera_1' | 'camera_2' | 'camera_3' | 'camera_4'

export class Campaign extends Renderer {

  private cameras: Record<CameraName, PerspectiveCamera | null> = {
    camera_1: null,
    camera_2: null,
    camera_3: null,
    camera_4: null,
  }

  private currentCamera: CameraName = 'camera_2';

  constructor() {
    super();
    this.load()

    window.addEventListener('mousemove', (e) => {

    })

    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case '1':
          this.transitionCamera('camera_1');
          break;
        case '2':
          this.transitionCamera('camera_2');
          break;
        case '3':
          this.transitionCamera('camera_3');
          break;
        case '4':
          this.transitionCamera('camera_4');
          break;

      }
    })
  }
  private isAnimatingCamera = false
  private transitionCamera(cameraName: CameraName) {
    if (cameraName === this.currentCamera || this.isAnimatingCamera) return
    this.currentCamera = cameraName
    this.isAnimatingCamera = true
    const newCamera = this.cameras[cameraName]!;
    const endRot = new Quaternion();
    const endPos = new Vector3();
    newCamera.getWorldQuaternion(endRot);
    newCamera.getWorldPosition(endPos);
    const startFOV = this.camera.fov;
    const clock = new Clock(true)
    let elapsedTime = 0

    const length = 2
    const animate = () => {
      const delta = clock.getDelta()
      elapsedTime = Math.min(1, elapsedTime + ((1 / length) * delta))

      this.camera.quaternion.slerp(endRot, elapsedTime);
      this.camera.position.lerp(endPos, elapsedTime);
      this.camera.fov = lerp(startFOV, newCamera.fov, elapsedTime);
      this.camera.updateProjectionMatrix();
      if (elapsedTime === 1) {
        this.isAnimatingCamera = false
      } else {
        requestAnimationFrame(animate);
      }
    };

    animate();

  }

  private async load() {
    const manager = new LoadingManager()
    LoaderUI(manager, 'Loading Campaign')
    const loader = getGLTFLoader(manager)

    const textureLoader = new TextureLoader(manager);

    const [mapAsset, textureEquirectangular] = await Promise.all([loader.loadAsync(map), textureLoader.loadAsync(awd)])
    textureEquirectangular.mapping = EquirectangularReflectionMapping;
    textureEquirectangular.encoding = sRGBEncoding;
    MAIN_UI_ELEMENT.textContent = ''

    this.scene.environment = textureEquirectangular

    const objectsToAdd: Object3D[] = []

    mapAsset.scene.traverse((o) => {
      const c = o as PerspectiveCamera
      if (c.isPerspectiveCamera) {
        if (c.parent) {
          c.parent.name = c.parent.name + '_Parent'
        }
        c.name = c.name.replace(/_Orientation$/, '')
        this.cameras[c.name as CameraName] = c

        if (c.name.startsWith(this.currentCamera)) {
          c.getWorldQuaternion(this.camera.quaternion);
          c.getWorldPosition(this.camera.position);
          this.camera.fov = c.fov;
          this.camera.focus = c.focus;
          this.camera.updateProjectionMatrix()
        }
      } else if (o.type === 'Mesh') {
        objectsToAdd.push(o)
      }
    })

    this.scene.add(...objectsToAdd)

    for (const key in this.cameras) {
      if (Object.prototype.hasOwnProperty.call(this.cameras, key)) {
        if (!this.cameras[key as CameraName]) {
          error(`Missing camera "${key}"`, Campaign.name)
        }
      }
    }

    this.updateRenderer(0)

  }

  private exit() {
    this.disposeRenderer();
  }

  protected update(delta: number) {
  }
}

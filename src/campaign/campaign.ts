import { Clock, EquirectangularReflectionMapping, LoadingManager, Object3D, PerspectiveCamera, Quaternion, sRGBEncoding, TextureLoader, Vector3 } from 'three';
import { Renderer } from '../renderer';
import { LoaderUI } from '../ui/loaderUI';
import { error, getGLTFLoader } from '../utils';
import map from '../assets/campaign/campaign_map.glb'
import awd from '../assets/campaign/hdri.jpg'

import { lerp } from 'three/src/math/MathUtils';
import { campaignUI } from '../ui/campaignUI';
import { DungeonInfo, DungeonParent } from '../dungeon/dungeon';
import { town1 } from './town1';
import { town2 } from './town2';
import { Inventory, InventoryUI } from '../ui/inventoryUI';
import { Character } from '../character/character';
import { createStats } from '../character/stats';
import { ItemName } from '../character/items';
import { getKeybinding } from '../keybindings';

export type TownName = 'camera_1' | 'camera_2' //  | 'camera_3' | 'camera_4'

export interface Shop {
  name: string,
  prices: Partial<Record<ItemName, { sell: number, buy: number }>>,
  inventory: Inventory
  money: number
}

export type Town<D extends string> = {
  dungeons: Record<D, DungeonInfo<any>>
  shops: Shop[]
}

export class Campaign extends Renderer implements DungeonParent {

  private cameras: Record<TownName, PerspectiveCamera | null> = {
    camera_1: null,
    camera_2: null,
    // camera_3: null,
    // camera_4: null,
  }

  currentTown: TownName = 'camera_1';
  private isAnimatingCamera = false
  towns: Record<TownName, Town<any>> = {
    camera_1: town1,
    camera_2: town2,
    // camera_3: town1,
    // camera_4: town1,
  }
  inventory: Inventory = {
    items: ['BasicGloves', 'SuperGloves', 'BasicSword', 'BasicSword', 'BasicSword', 'BasicSword', 'BasicSword', 'BasicSword', 'BasicSword', 'BasicSword'],
    size: 12
  }
  character: Character = {
    class: 'awd',
    items: {},
    money: 1000
  }
  stats = createStats(this.character)

  inventoryUI = new InventoryUI(this.inventory, this.character, this.stats)

  ui = new campaignUI(this)

  constructor() {
    super();
    // this.inventoryUI.showShop(this.towns.camera_1.shops[0])
    this.load()

    window.addEventListener('keydown', this.keydown)

  }

  changeTown(cameraName: TownName) {
    if (cameraName === this.currentTown || this.isAnimatingCamera || !this.ui.enabled) return
    this.ui.hide()
    this.currentTown = cameraName
    this.isAnimatingCamera = true
    const newCamera = this.cameras[cameraName]!;
    const endRot = new Quaternion();
    const endPos = new Vector3();
    newCamera.getWorldQuaternion(endRot);
    newCamera.getWorldPosition(endPos);
    const startFOV = this.camera.fov;
    const startFocus = this.camera.focus;
    const clock = new Clock(true)
    let elapsedTime = 0

    const length = 2
    const animate = () => {
      const delta = clock.getDelta()
      elapsedTime = Math.min(1, elapsedTime + ((1 / length) * delta))
      const t = elapsedTime * elapsedTime * elapsedTime
      this.camera.quaternion.slerp(endRot, t);
      this.camera.position.lerp(endPos, t);
      this.camera.fov = lerp(startFOV, newCamera.fov, t);
      this.camera.focus = lerp(startFocus, newCamera.fov, t);
      this.camera.updateProjectionMatrix();

      if (elapsedTime === 1) {
        this.isAnimatingCamera = false

        this.ui.show()
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
    this.ui.show()

    this.scene.environment = textureEquirectangular

    const objectsToAdd: Object3D[] = []

    mapAsset.scene.traverse((o) => {
      const c = o as PerspectiveCamera
      if (c.isPerspectiveCamera) {
        if (c.parent) {
          c.parent.name = c.parent.name + '_Parent'
        }
        c.name = c.name.replace(/_Orientation$/, '')
        this.cameras[c.name as TownName] = c

        if (c.name.startsWith(this.currentTown)) {
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
        if (!this.cameras[key as TownName]) {
          error(`Missing camera "${key}"`, Campaign.name)
        }
      }
    }

    this.updateRenderer(0)

  }

  private exit() {
    window.removeEventListener('keydown', this.keydown)
    this.disposeRenderer();
  }

  protected update(delta: number) {
  }

  private keydown = (e: KeyboardEvent) => {
    if (this.inventoryUI.visible) return;
    e.preventDefault()
    switch (e.key.toUpperCase()) {
      case getKeybinding('Inventory', 'ToggleInventory'):
        this.inventoryUI.toggle()
        break;
    }
  }
}

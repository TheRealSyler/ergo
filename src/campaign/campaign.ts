import { Clock, EquirectangularReflectionMapping, LoadingManager, Object3D, PerspectiveCamera, Quaternion, Scene, sRGBEncoding, TextureLoader, Vector3 } from 'three';
import { Renderer } from '../renderer';
import { LoaderUI } from '../ui/loaderUI';
import { error, getGLTFLoader } from '../utils';
import map from '../assets/campaign/campaign_map.glb'
import awd from '../assets/campaign/hdri.jpg'

import { lerp } from 'three/src/math/MathUtils';
import { campaignUI } from '../ui/campaignUI';
import { Dungeon, DungeonInfo, DungeonParent } from '../dungeon/dungeon';
import { town1 } from './town1';
import { town2 } from './town2';
import { town4 } from './town4';
import { town3 } from './town3';
import { Inventory, InventoryUI } from '../ui/inventoryUI';
import { Character, createCharacter } from '../character/character';
import { createStats } from '../character/stats';
import { ItemName } from '../character/items';
import { getKeybinding } from '../keybindings';
import { MainQuestNames, Quest } from './quests';
import { QuestBoardUI } from '../ui/questBoard';
import { QuestUI } from '../ui/questUI';


export type TownName = 'camera_1' | 'camera_2' | 'camera_3' | 'camera_4'

export interface Shop {
  name: string,
  prices: Partial<Record<ItemName, { sell: number, buy: number }>>,
  inventory: Inventory
  money: number
}

export type Town<D extends string> = {
  dungeons: Record<D, DungeonInfo<any>>
  shops: Shop[]
  travelCost: number,
  isUnlocked: boolean
}

export class Campaign extends Renderer implements DungeonParent {

  private cameras: Record<TownName, PerspectiveCamera | null> = {
    camera_1: null,
    camera_2: null,
    camera_3: null,
    camera_4: null,
  }

  currentTown: TownName = 'camera_1';
  private isAnimatingCamera = false
  towns: Record<TownName, Town<any>> = {
    camera_1: town1,
    camera_2: town2,
    camera_3: town3,
    camera_4: town4,
  }
  inventory: Inventory = {
    items: ['BasicArmor', 'BasicGloves', 'BasicSword', 'SuperGloves', 'Bandage', 'BanditBounty'],
    size: 12
  }
  character: Character = createCharacter()
  stats = createStats(this.character)
  quest: {
    main?: MainQuestNames,
    // side: []
  } = {
      main: 'GetBanditBounty'
    }

  questBoardUI = new QuestBoardUI(this)
  questUI = new QuestUI(this)
  inventoryUI = new InventoryUI(this.inventory, this.character, this.stats)

  ui = new campaignUI(this)
  private dungeon?: Dungeon<any>;
  constructor() {
    super();
    // this.inventoryUI.showShop(this.towns.camera_1.shops[0])
    this.load()
    window.addEventListener('keydown', this.keydown)

  }

  changeTown(newTown: TownName) {
    if (newTown === this.currentTown || this.isAnimatingCamera || !this.ui.enabled || !this.towns[newTown].isUnlocked) return
    if (this.character.money - this.towns[newTown].travelCost < 0) {
      console.log('You don\' have enough money to travel to', newTown)
      return // TODO add ui hint.
    }
    this.character.money -= this.towns[newTown].travelCost
    this.ui.hide()
    this.currentTown = newTown
    this.isAnimatingCamera = true
    const newCamera = this.cameras[newTown]!;
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
    // TODO exit to main menu
    window.removeEventListener('keydown', this.keydown)
    this.disposeRenderer();
  }

  loadDungeon(dungeonInfo: DungeonInfo<any>) {
    if (dungeonInfo.cost) {
      if (this.character.money - dungeonInfo.cost < 0) {
        return // TODO add ui hint.
      }
      this.character.money -= dungeonInfo.cost
    }
    const savedScene = this.scene
    const savedCamera = this.camera;
    this.scene = new Scene()
    this.camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 1000)
    this.dungeon = new Dungeon(dungeonInfo, this, () => { }, () => {
      this.scene = savedScene
      this.camera = savedCamera
      this.dungeon = undefined
      this.ui.show()
    })

  }

  protected update(delta: number) {
    if (this.dungeon) {
      this.dungeon.update((delta - this.previousRAF) * 0.001)
    }
  }

  checkQuest(quest: Quest<TownName, any, any>): Record<keyof Quest<TownName, any, any>['objective'] | 'canBeCompleted', boolean> {
    let hasItem = false
    let hasTraveledTo = false
    let canBeCompleted = true
    if (quest.objective.getItem) {
      for (let i = 0; i < this.inventory.items.length; i++) {
        const item = this.inventory.items[i];
        if (item === quest.objective.getItem) {
          hasItem = true
          break;
        }
      }
      if (!hasItem) {
        canBeCompleted = false
      }
    }
    // TODO add travel check
    if (!hasTraveledTo) {
      // canBeCompleted = false
    }
    return { getItem: hasItem, canBeCompleted, travelToTown: hasTraveledTo }
  }

  completeQuest(quest: Quest<TownName, any, any>, questName: string, isMain: boolean) {
    if (this.checkQuest(quest).canBeCompleted) {
      if (isMain) {
        this.quest.main = quest.reward.unlockQuest as MainQuestNames
      }
      if (quest.reward.unlockQuest) {
        // TODO

      }

      if (quest.objective.getItem) {
        for (let i = 0; i < this.inventory.items.length; i++) {
          const item = this.inventory.items[i];
          if (item === quest.objective.getItem) {
            this.inventory.items[i] = undefined
            break;
          }
        }
      }

      if (quest.reward.money) {
        this.character.money += quest.reward.money
      }
      if (quest.reward.unlockTown) {
        this.towns[quest.reward.unlockTown].isUnlocked = true
        this.ui.show()
      }
      if (quest.reward.loot) {
        this.inventoryUI.show({ name: `${questName} Reward`, inventory: quest.reward.loot })
        this.questBoardUI.hide()

      } else {
        this.questBoardUI.show()
        this.questUI.show()
      }
    } else {
      // TODO add ui hint
      console.log('TODO add hint that quest could not be completed.')
    }
  }

  private keydown = (e: KeyboardEvent) => {
    if (this.inventoryUI.visible || this.dungeon || this.questBoardUI.visible) return;
    switch (e.key.toUpperCase()) {
      case getKeybinding('Inventory', 'ToggleInventory'):
        e.preventDefault()
        this.inventoryUI.toggle()
        break;
      case getKeybinding('Campaign', 'OpenQuestBoard'):
        e.preventDefault()
        this.questBoardUI.toggle()
    }
  }

}

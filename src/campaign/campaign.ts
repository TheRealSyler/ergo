import { Clock, EquirectangularReflectionMapping, LoadingManager, MathUtils, Object3D, PerspectiveCamera, Quaternion, Scene, TextureLoader, Vector3, sRGBEncoding } from 'three'
import map from '../assets/campaign/campaign_map.glb'
import awd from '../assets/campaign/hdri.jpg'
import { createCharacter, type Character } from '../character/character'
import { type ItemName } from '../character/items'
import { LevelCharacter, createStats } from '../character/stats'
import { Dungeon, type DungeonInfo, type DungeonParent } from '../dungeon/dungeon'
import { getKeybinding } from '../keybindings'
import { Renderer } from '../renderer'
import { campaignUI } from '../ui/campaignUI'
import { ColorText, JoinSpanEl } from '../ui/components'
import { InventoryUI, type Inventory } from '../ui/inventoryUI'
import { LoaderUI } from '../ui/loaderUI'
import { NotEnoughMoneyNotification, expGainNotification } from '../ui/notifications'
import { QuestBoardUI } from '../ui/questBoard'
import { NOTIFICATIONS } from '../ui/ui'
import { error, getGLTFLoader } from '../utils'
import type { CampaignQuestNames, Quest } from './quests'
import { town1, type Town1Dungeons } from './town1'
import { town2, type Town2Dungeons } from './town2'
import { town3, type Town3Dungeons } from './town3'
import { town4, type Town4Dungeons } from './town4'

export interface Towns {
  'camera_1': Town1Dungeons
  'camera_2': Town2Dungeons
  'camera_3': Town3Dungeons
  'camera_4': Town4Dungeons
}

export type TownName = keyof Towns

export interface Shop {
  name: string,
  prices: Partial<Record<ItemName, { sell: number, buy: number }>>,
  inventory: Inventory
  money: number
}

export type Town<D extends string> = {
  dungeons: Record<D, DungeonInfo<string>>
  shops: Shop[]
  travelCost: number,
  isUnlocked: boolean,
  hasBeenVisited: boolean,
}

export class Campaign extends Renderer implements DungeonParent {

  private cameras: Record<TownName, PerspectiveCamera | null> = {
    camera_1: null,
    camera_2: null,
    camera_3: null,
    camera_4: null,
  }

  currentTown: TownName = 'camera_1'
  private isAnimatingCamera = false
  towns: Record<TownName, Town<string>> = {
    camera_1: town1,
    camera_2: town2,
    camera_3: town3,
    camera_4: town4,
  }
  inventory: Inventory = {
    items: [],
    size: 12
  }
  character: Character = createCharacter({ items: {}, money: 50 })
  stats = createStats(this.character)
  quests: CampaignQuestNames[] = ['GetBanditBounty']

  questBoardUI = new QuestBoardUI(this)
  inventoryUI = new InventoryUI(this.inventory, this.character, this.stats)

  ui = new campaignUI(this)
  private dungeon?: Dungeon<string>
  constructor() {
    super()
    this.load()

  }

  changeTown(newTown: TownName) {
    if (newTown === this.currentTown || this.isAnimatingCamera || !this.ui.enabled || !this.towns[newTown].isUnlocked) return
    if (!this.towns[newTown].hasBeenVisited) {
      if (!this.SpendMoney(this.towns[newTown].travelCost)) return

      this.towns[newTown].hasBeenVisited = true
    }

    this.ui.hide()
    this.ui.tooltip.setPos({ x: -10000, y: -1000 }) // to hide the tooltip.
    this.currentTown = newTown
    this.isAnimatingCamera = true
    const newCamera = this.cameras[newTown]!
    const endRot = new Quaternion()
    const endPos = new Vector3()
    newCamera.getWorldQuaternion(endRot)
    newCamera.getWorldPosition(endPos)
    const startFOV = this.camera.fov
    const startFocus = this.camera.focus
    const clock = new Clock(true)
    let elapsedTime = 0

    const length = 2
    const animate = () => {
      const delta = clock.getDelta()
      elapsedTime = Math.min(1, elapsedTime + ((1 / length) * delta))
      const t = elapsedTime * elapsedTime * elapsedTime
      this.camera.quaternion.slerp(endRot, t)
      this.camera.position.lerp(endPos, t)
      this.camera.fov = MathUtils.lerp(startFOV, newCamera.fov, t)
      this.camera.focus = MathUtils.lerp(startFocus, newCamera.fov, t)
      this.camera.updateProjectionMatrix()

      if (elapsedTime === 1) {
        this.isAnimatingCamera = false

        this.ui.show()
      } else {
        requestAnimationFrame(animate)
      }
    }

    animate()

  }

  private async load() {
    const manager = new LoadingManager()
    LoaderUI(manager, 'Loading Campaign')
    const loader = getGLTFLoader(manager)

    const textureLoader = new TextureLoader(manager)

    const [mapAsset, textureEquirectangular] = await Promise.all([loader.loadAsync(map), textureLoader.loadAsync(awd)])
    textureEquirectangular.mapping = EquirectangularReflectionMapping
    textureEquirectangular.encoding = sRGBEncoding
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
          c.getWorldQuaternion(this.camera.quaternion)
          c.getWorldPosition(this.camera.position)
          this.camera.fov = c.fov
          this.camera.focus = c.focus
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
    window.addEventListener('keydown', this.keydown)
    // this.inventoryUI.show()
    // this.questBoardUI.show()
  }

  private exit() {

    window.removeEventListener('keydown', this.keydown)
    this.disposeRenderer()
  }

  loadDungeon(dungeonInfo: DungeonInfo<string>) {
    if (dungeonInfo.cost) {
      if (!this.SpendMoney(dungeonInfo.cost)) return
    }
    const savedScene = this.scene
    const savedCamera = this.camera
    this.scene = new Scene()
    this.camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 1000)
    this.dungeon = new Dungeon(dungeonInfo, this, false, () => {
      this.scene = savedScene
      this.camera = savedCamera
      this.dungeon = undefined
      this.updateRenderer(0)
      this.unpause()
      this.ui.show()
    }, () => this.exit.bind(this),
      true
    )

  }

  protected update(delta: number) {
    if (this.dungeon) {
      this.dungeon.update((delta - this.previousRAF) * 0.001)
    }
  }

  checkQuest(quest: Quest<TownName, string>): Record<keyof Quest<TownName, string>['objective'] | 'canBeCompleted', boolean> {
    let hasItem = false
    let hasTraveledToTown = false
    let hasCompletedDungeon = false
    let canBeCompleted = true
    if (quest.objective.getItem) {
      for (let i = 0; i < this.inventory.items.length; i++) {
        const item = this.inventory.items[i]
        if (item === quest.objective.getItem) {
          hasItem = true
          break
        }
      }
      if (!hasItem) {
        canBeCompleted = false
      }
    }
    const town = quest.objective.travelToTown
    if (town) {
      if (this.towns[town].hasBeenVisited) {
        hasTraveledToTown = true
      } else {
        canBeCompleted = false
      }
    }
    const completeDungeon = quest.objective.completeDungeon
    if (completeDungeon) {
      if (this.towns[completeDungeon.town].dungeons[completeDungeon.dungeon]?.hasBeenCompleted) {
        hasCompletedDungeon = true
      } else {
        canBeCompleted = false
      }
    }
    return { getItem: hasItem, canBeCompleted, travelToTown: hasTraveledToTown, completeDungeon: hasCompletedDungeon }
  }

  completeQuest(quest: Quest<TownName, string>, completedQuestName: string) {
    if (this.checkQuest(quest).canBeCompleted) {
      this.quests = this.quests.filter((quest) => quest != completedQuestName)
      const CompletedQuest = () => JoinSpanEl(ColorText(completedQuestName, 'Quest'), ColorText('COMPLETED', 'StatPos'))
      NOTIFICATIONS.Show(CompletedQuest())
      const unlockedQuests = quest.reward.unlockQuest
      if (unlockedQuests) {
        const UnlockedQuestNotification = (quest: string) => NOTIFICATIONS.Show(JoinSpanEl(CompletedQuest(), JoinSpanEl(ColorText('Unlocked', 'White'), ColorText(quest, 'Quest'))))
        if (typeof unlockedQuests === 'string') {
          this.quests.push(unlockedQuests)
          UnlockedQuestNotification(unlockedQuests)
        } else {
          for (const unlockedQuest of unlockedQuests) {
            UnlockedQuestNotification(unlockedQuest)
          }
          this.quests.push(...unlockedQuests)
        }
      }

      // remove item from play inventory.
      if (quest.objective.getItem) {
        for (let i = 0; i < this.inventory.items.length; i++) {
          const item = this.inventory.items[i]
          if (item === quest.objective.getItem) {
            this.inventory.items[i] = undefined
            break
          }
        }
      }

      if (quest.reward.money) {
        NOTIFICATIONS.Show(JoinSpanEl(CompletedQuest(), JoinSpanEl(ColorText(`+${quest.reward.money}`, 'Money'), 'Gold')))
        this.character.money += quest.reward.money
      }
      if (quest.reward.unlockTown) {
        NOTIFICATIONS.Show(JoinSpanEl(CompletedQuest(), JoinSpanEl(ColorText('Unlocked', 'White'), ColorText(quest.reward.unlockTown, 'Town'))))
        this.towns[quest.reward.unlockTown].isUnlocked = true
      }
      expGainNotification(quest.reward.exp, CompletedQuest())
      LevelCharacter(this.character, this.stats, quest.reward.exp)

      if (quest.reward.loot) {
        this.inventoryUI.show({ name: `${completedQuestName} Reward`, inventory: quest.reward.loot }, () => this.questBoardUI.show())
        this.questBoardUI.hide()

      } else {
        this.questBoardUI.show()
      }


    } else {
      NOTIFICATIONS.Show(JoinSpanEl(ColorText(completedQuestName, 'Quest'), ColorText('[ERROR] Quest Could not be Completed (this should never happen)', 'StatNeg')))
    }
  }

  private keydown = (e: KeyboardEvent) => {
    if (this.inventoryUI.visible || this.dungeon || this.questBoardUI.visible) return
    switch (e.key.toUpperCase()) {
      case getKeybinding('Inventory', 'ToggleInventory'):
        e.preventDefault()
        this.inventoryUI.toggle()
        break
      case getKeybinding('Campaign', 'OpenQuestBoard'):
        e.preventDefault()
        this.questBoardUI.toggle()
    }
  }

  EnoughMoneyCheck(cost: number) {
    return this.character.money - cost > 0
  }

  /**Returns TRUE if the player has enough money. */
  SpendMoney(cost: number) { // TODO find better name ?
    if (!this.EnoughMoneyCheck(cost)) {
      NotEnoughMoneyNotification(cost - this.character.money)
      return false
    }
    this.character.money -= cost
    return true
  }
}

import { Group, LoadingManager, MathUtils, Object3D, Raycaster, Vector2, Vector3 } from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { CampaignQuestNames } from '../campaign/quests'
import type { Character } from '../character/character'
import { CharacterController } from '../character/characterController'
import type { ItemName } from '../character/items'
import { loadCharacter } from '../character/loadCharacter'
import type { CharacterStats } from '../character/stats'
import { FightController } from '../fight/fightController'
import type { Player } from '../game'
import { getKeybinding, getKeybindingUI } from '../keybindings'
import { Renderer } from '../renderer'
import { loadRoom } from '../rooms/rooms'
import { DungeonUI } from '../ui/dungeonUI'
import { FightUI, victoryOrLossUI } from '../ui/fightUI'
import { InventoryUI, type Inventory } from '../ui/inventoryUI'
import { LoaderUI } from '../ui/loaderUI'
import { OptionsUI } from '../ui/optionsUI'
import { PauseMenuUI } from '../ui/pauseMenuUI'
import { dirToRadians, getGLTFLoader, wait } from '../utils'
import { loadRoomDoor, type RoomDoorAsset } from './doors'
import type { DungeonRoom, DungeonRooms, RoomItemInfo } from './dungeonRoom'
import { loadRoomItem, type RoomItemAsset } from './dungeonRoomItem'


export interface DungeonParent extends Renderer {
  inventory: Inventory,
  character: Character,
  stats: CharacterStats,
  inventoryUI: InventoryUI,
  quests?: CampaignQuestNames[]
}
interface InterActableObject {
  collision: Object3D
  name: string
  removeIfEmpty?: boolean
  loot?: Inventory
  scene: Group
  func: (self: InterActableObject) => void
}

export type DungeonDir = 'north' | 'east' | 'west' | 'south'

type RoomItemInfoAndAsset = {
  asset: RoomItemAsset
  info: RoomItemInfo
}

type RoomDoorAssetAndDir = {
  asset: RoomDoorAsset
  dir: DungeonDir
}

export interface DungeonInfo<Rooms extends string> {
  rooms: DungeonRooms<Rooms>,
  firstRoom: Rooms,
  entryDir: DungeonDir,
  cost?: number,
  hasBeenCompleted?: boolean
}

export class Dungeon<Rooms extends string> {
  private collisionObjects: Object3D[] = []
  private collisionRaycaster = new Raycaster(undefined, undefined, undefined, 5)
  private activeItemRaycaster = new Raycaster(undefined, undefined, undefined, 1.8)
  private readonly activeItemRayCasterCoords = new Vector2(0, 0)
  private reusableVec = new Vector3()

  private keys = {
    forward: false,
    back: false,
    left: false,
    right: false
  }

  private controls = new PointerLockControls(this.parent.camera, this.parent.renderer.domElement)

  private interActableObjects: InterActableObject[] = []
  private activeObj?: InterActableObject

  private fightCon?: FightController
  private currentRoom: DungeonRoom<Rooms>

  private ui = new DungeonUI(this.parent.quests)
  private pauseMenu = new PauseMenuUI()
  private isPauseMenuVisible = false
  private rooms: DungeonRooms<Rooms>
  constructor(private dungeonInfo: DungeonInfo<Rooms>, private parent: DungeonParent, private onLoad: (() => void) | false, private onExit: () => void, private goToMainMenu: () => void, private runOption = false) {
    this.rooms = dungeonInfo.rooms
    this.currentRoom = this.rooms[dungeonInfo.firstRoom]
    this.load(this.rooms[dungeonInfo.firstRoom], dungeonInfo.entryDir)
    this.addListeners()

  }

  private addListeners = () => {
    window.addEventListener('click', this.click)
    window.addEventListener('keydown', this.keydown)
    window.addEventListener('keyup', this.keyup)
  }
  private removeListeners = () => {
    window.removeEventListener('click', this.click)
    window.removeEventListener('keydown', this.keydown)
    window.removeEventListener('keyup', this.keyup)
  }

  private exit() {
    this.controls.unlock()
    this.controls.disconnect()
    this.controls.dispose()
    this.removeListeners()
    this.onExit()
  }
  /**exits the dungeon with low health */
  private run = () => {
    this.parent.stats.health = this.parent.stats.maxHealth * 0.1
    this.exit()
  }

  private async load(dungeonRoom: DungeonRoom<Rooms>, dir: DungeonDir) {
    this.currentRoom = dungeonRoom
    this.reset()
    this.setCamera(dir)
    const manager = new LoadingManager()
    LoaderUI(manager, `Loading Dungeon Room ${dungeonRoom.name}`)

    const loader = getGLTFLoader(manager)

    const [room, roomItems, doors, fight] = await Promise.all([
      loadRoom(dungeonRoom.name, manager, loader),
      Promise.all(this.extractRoomItemPromisees(dungeonRoom, loader)),
      Promise.all(this.extractRoomDoorPromisees(dungeonRoom, loader)),
      dungeonRoom.fight ? Promise.all([loadCharacter(loader, this.parent.character), loadCharacter(loader, dungeonRoom.fight.char)]) : undefined
    ])

    this.ui.show()

    this.parent.scene.add(room.scene)
    this.parent.scene.environment = room.background || null
    this.collisionObjects.push(...room.collisions)

    this.addRoomItems(roomItems)

    this.addRoomDoor(dungeonRoom, doors)

    if (fight) {
      this.controls.unlock()
      const ui = new FightUI()
      const [playerChar1, playerChar2] = fight

      const players: Record<Player, CharacterController> = {
        player1: new CharacterController('player1', ui, playerChar1, this.parent.stats),
        player2: new CharacterController('player2', ui, playerChar2)
      }
      this.parent.scene.add(players.player1.model)
      this.parent.scene.add(players.player2.model)

      this.fightCon = new FightController(players, ui, 'player1', this.parent, {
        exitToMainMenu: () => { console.log('TODO exit to main menu') },
        showInventoryInMenu: (addListeners) => {
          this.parent.inventoryUI.show(undefined, addListeners)
        },
        run: this.runOption ? this.run.bind(this) : undefined,
        customEndScreen: async (victory, dispose, endScreen) => {
          if (victory) {
            victoryOrLossUI(victory)
            await wait(1500)
            this.parent.camera.removeFromParent()
            this.setCamera(dir)
            this.fightCon = undefined
            this.parent.scene.remove(players.player1.model)
            // this.scene.remove(players.player2.model);

            const dungeonFight = dungeonRoom.fight!
            dungeonRoom.fight = undefined

            const loot: Inventory = { items: [...(dungeonFight.loot?.items || []), ...this.characterItemsToArray(dungeonFight.char)] }
            const newRoomItem: RoomItemInfoAndAsset = { asset: await loadRoomItem(loader, 'enemy'), info: { asset: 'enemy', items: loot, removeIfEmpty: true } }
            this.ui.show()
            this.parent.character.money += playerChar2.character.money
            this.parent.stats.stamina = this.parent.stats.maxStamina
            if (!this.areItemsEmpty(loot.items)) {
              this.parent.inventoryUI.show({ name: 'Fight', inventory: loot }, () => {
                if (!this.areItemsEmpty(newRoomItem.info.items!.items)) {
                  dungeonRoom.objectInfos.push(newRoomItem.info)
                  this.addRoomItems([newRoomItem])
                }
              })
            }

            dispose()
          } else {
            endScreen()
          }

        }
      })
    }
    this.onLoad && this.onLoad()
  }

  private extractRoomItemPromisees(dungeonRoom: DungeonRoom<Rooms>, loader: GLTFLoader) {
    const roomItemPromises: Promise<RoomItemInfoAndAsset>[] = []
    for (const info of dungeonRoom.objectInfos) {
      // eslint-disable-next-line no-async-promise-executor
      roomItemPromises.push(new Promise(async (res) => {
        res({
          asset: await loadRoomItem(loader, info.asset),
          info: info
        })
      }))
    }
    return roomItemPromises
  }

  private extractRoomDoorPromisees(dungeonRoom: DungeonRoom<Rooms>, loader: GLTFLoader) {
    const roomDoorPromises: Promise<RoomDoorAssetAndDir>[] = []
    for (const key in dungeonRoom.doors) {
      if (Object.prototype.hasOwnProperty.call(dungeonRoom.doors, key)) {
        const door = dungeonRoom.doors[key as DungeonDir]
        if (door) {

          // eslint-disable-next-line no-async-promise-executor
          roomDoorPromises.push(new Promise(async (res) => {
            res({
              asset: await loadRoomDoor(loader, door.asset),
              dir: key as DungeonDir,
            })
          }))
        }
      }
    }

    return roomDoorPromises
  }

  private addRoomItems(roomItems: RoomItemInfoAndAsset[]) {
    for (const { asset, info } of roomItems) {
      this.parent.scene.add(asset.scene)
      if (info.position) {
        const { x, y, z } = info.position
        asset.scene.position.set(x, y, z)
      }
      if (info.rotation) {
        const { x, y, z } = info.rotation
        asset.scene.rotation.set(x, y, z)
      }
      this.collisionObjects.push(asset.collision)
      this.interActableObjects.push({
        func: (self) => {
          if (self.loot) {
            this.controls.unlock()
            this.parent.inventoryUI.show({ inventory: self.loot, name: self.name }, () => {
              if (self.removeIfEmpty && this.areItemsEmpty(self.loot!.items)) {
                this.collisionObjects = this.collisionObjects.filter((v) => v !== self.collision)
                this.interActableObjects = this.interActableObjects.filter((v) => v !== self)
                this.currentRoom.objectInfos = this.currentRoom.objectInfos.filter((v) => v !== info)
                self.scene.removeFromParent()
              }
            })
          }
        },
        scene: asset.scene,
        loot: info.items,
        removeIfEmpty: info.removeIfEmpty,
        name: info.asset,
        collision: asset.collision
      })
    }
  }

  private addRoomDoor(dungeonRoom: DungeonRoom<Rooms>, doors: RoomDoorAssetAndDir[]) {
    for (const { asset, dir } of doors) {
      const door = dungeonRoom.doors[dir]!
      this.parent.scene.add(asset.scene)
      this.collisionObjects.push(asset.collision)
      asset.scene.rotateY(dirToRadians(dir))
      asset.scene.translateZ(-5)
      this.interActableObjects.push({
        scene: asset.scene,
        collision: asset.collision,
        name: door.type === 'room' ? door.roomId + ' ' + dir : 'Exit ' + dir + (door.type === 'exit-completed' ? ' (Complete Dungeon)' : ''),
        func: () => {
          switch (door.type) {
            case 'exit-completed':
              this.dungeonInfo.hasBeenCompleted = true
              this.exit()
              break
            case 'exit':
              this.exit()
              break

            case 'room':
              this.load(this.rooms[door.roomId], dir)
              break
          }
        }
      })
    }
  }

  private setCamera(dir: DungeonDir) {
    this.parent.camera.near = 0.01
    this.parent.camera.updateProjectionMatrix()
    this.parent.camera.rotation.set(0, dirToRadians(dir) + MathUtils.degToRad(180), 0)
    this.parent.camera.position.set(0, 1.6, 0)
    this.parent.camera.translateZ(-4)
    this.parent.camera.rotateY(MathUtils.degToRad(180))
  }

  private reset() {
    this.collisionObjects = []
    this.interActableObjects = []
    this.parent.scene.clear()
  }

  update(timeElapsedSeconds: number) {
    if (this.fightCon) {
      this.fightCon.update(timeElapsedSeconds)
    } else if (!this.isPauseMenuVisible) {
      this.updateMovement(timeElapsedSeconds)

      this.setActiveObject()
    }
  }

  private setActiveObject() {
    this.activeItemRaycaster.setFromCamera(this.activeItemRayCasterCoords, this.parent.camera)
    const intersections = this.activeItemRaycaster.intersectObjects(this.collisionObjects)

    let closestObj: { i: InterActableObject; dist: number } | undefined
    for (const intersection of intersections) {
      const interActableItem = this.interActableObjects.find((item) => item.collision === intersection.object)
      if (interActableItem) {
        if (!closestObj || closestObj.dist > intersection.distance) {
          closestObj = { i: interActableItem, dist: intersection.distance }
        }
      }
    }

    if (this.activeObj !== closestObj?.i) {
      this.activeObj = closestObj?.i
      if (this.activeObj) {
        this.ui.showActiveObject(`${getKeybindingUI('Dungeon', 'Interact')} - ${this.activeObj.name}`)
      } else {
        this.ui.showActiveObject('')
      }
    }
  }

  private updateMovement(timeElapsedSeconds: number) {
    const speed = 3 * timeElapsedSeconds
    if (this.keys.forward) {
      this.reusableVec.setFromMatrixColumn(this.parent.camera.matrix, 0)
      this.reusableVec.crossVectors(this.parent.camera.up, this.reusableVec)
      if (this.checkCollision(this.parent.camera.position, this.reusableVec)) {
        this.controls.moveForward(speed)
      }
    }
    if (this.keys.back) {
      this.reusableVec.setFromMatrixColumn(this.parent.camera.matrix, 0)
      this.reusableVec.crossVectors(this.reusableVec, this.parent.camera.up)
      if (this.checkCollision(this.parent.camera.position, this.reusableVec)) {
        this.controls.moveForward(-speed)
      }
    }
    if (this.keys.right) {
      this.reusableVec.setFromMatrixColumn(this.parent.camera.matrix, 1)
      this.reusableVec.crossVectors(this.reusableVec, this.parent.camera.up)
      if (this.checkCollision(this.parent.camera.position, this.reusableVec)) {
        this.controls.moveRight(speed)
      }
    }
    if (this.keys.left) {
      this.reusableVec.setFromMatrixColumn(this.parent.camera.matrix, 1)
      this.reusableVec.crossVectors(this.parent.camera.up, this.reusableVec)
      if (this.checkCollision(this.parent.camera.position, this.reusableVec)) {
        this.controls.moveRight(-speed)
      }
    }
  }

  private checkCollision(pos: Vector3, dir: Vector3) {

    this.collisionRaycaster.set(pos, dir)

    const interSections = this.collisionRaycaster.intersectObjects(this.collisionObjects)

    if (interSections.length > 0) {
      for (const intersection of interSections) {
        if (intersection.distance < 0.3) {
          return false
        }
      }
    }
    return true
  }

  private click = () => {
    if (!this.fightCon && !this.parent.inventoryUI.visible && !this.isPauseMenuVisible) {
      this.controls.lock()
    }
  }

  private keydown = (e: KeyboardEvent) => {
    if (!this.fightCon && !this.isPauseMenuVisible) {
      if (e.key.toUpperCase() === getKeybinding('Inventory', 'ToggleInventory')) {
        e.preventDefault()
        if (this.parent.inventoryUI.visible) {
          this.parent.inventoryUI.hide()
          this.controls.lock()
        } else {
          this.controls.unlock()
          this.parent.inventoryUI.show()
        }
      }

      if (this.parent.inventoryUI.visible) return

      switch (e.key.toUpperCase()) {
        case getKeybinding('Dungeon', 'PauseMenu'):
          this.controls.unlock()
          this.showPauseMenu()
          break
        case getKeybinding('Dungeon', 'MoveForward'):
          this.keys.forward = true
          break
        case getKeybinding('Dungeon', 'MoveBack'):
          this.keys.back = true
          break
        case getKeybinding('Dungeon', 'MoveLeft'):
          this.keys.left = true
          break
        case getKeybinding('Dungeon', 'MoveRight'):
          this.keys.right = true
          break
        case getKeybinding('Dungeon', 'Interact'):
          if (this.activeObj) {
            this.activeObj.func(this.activeObj)
          }
          break
      }
    }
  }

  private keyup = (e: KeyboardEvent) => {
    switch (e.key.toUpperCase()) {
      case getKeybinding('Dungeon', 'MoveForward'):
        this.keys.forward = false
        break
      case getKeybinding('Dungeon', 'MoveBack'):
        this.keys.back = false
        break
      case getKeybinding('Dungeon', 'MoveLeft'):
        this.keys.left = false
        break
      case getKeybinding('Dungeon', 'MoveRight'):
        this.keys.right = false
        break
    }
  }

  private showPauseMenu() {
    this.isPauseMenuVisible = true
    this.pauseMenu.show({
      mainMenu: () => {
        this.exit()
        this.goToMainMenu()
      },
      inventory: (addListeners) => {
        this.parent.inventoryUI.show(undefined, addListeners)
      },
      options: OptionsUI,
      run: this.runOption ? this.run.bind(this) : undefined,
      resume: () => {
        this.ui.show()
        this.controls.lock()
        this.isPauseMenuVisible = false
      }
    })
  }

  private areItemsEmpty(items: Inventory['items']) {
    let areItemsEmpty = true
    items.forEach(item => {
      if (item) {
        areItemsEmpty = false
      }
    })
    return areItemsEmpty
  }

  private characterItemsToArray(char: Character) {
    const items: ItemName[] = []
    for (const key in char.items) {
      if (Object.prototype.hasOwnProperty.call(char.items, key)) {
        const item = char.items[key as keyof Character['items']]
        if (item) {
          items.push(item)
        }
      }
    }
    return items
  }
}
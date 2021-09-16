import { Renderer } from '../renderer';
import { Object3D, Raycaster, Vector3, LoadingManager, Group } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { loadRoom } from '../rooms/rooms';
import { DungeonRoom, DungeonRooms, RoomItemInfo } from './dungeonRoom';
import { LoaderUI } from '../ui/loaderUI';
import { Character } from '../character/character';
import { loadCharacter } from '../character/loadCharacter';
import { dirToRadians, getGLTFLoader, wait } from '../utils';
import { FightController } from '../fight/fightController';
import { FightUI, victoryOrLossUI } from '../ui/fightUI';
import { CharacterController } from '../character/characterController';
import { Player } from '../game';
import { loadRoomItem, RoomItemAsset } from './dungeonRoomItem';
import { DungeonUI } from '../ui/dungeonUI';
import { degToRad } from 'three/src/math/MathUtils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { loadRoomDoor, RoomDoorAsset } from './doors';
import { Inventory, InventoryUI } from '../ui/inventoryUI';
import { getKeybinding } from '../keybindings';
import { ItemName } from '../character/items';

interface InterActableObject {
  collision: Object3D;
  name: string
  removeIfEmpty?: boolean
  loot?: Inventory
  scene: Group
  func: (self: InterActableObject) => void
}

export type DungeonDir = 'north' | 'east' | 'west' | 'south';

type RoomItemInfoAndAsset = {
  asset: RoomItemAsset;
  info: RoomItemInfo;
};

type RoomDoorAssetAndDir = {
  asset: RoomDoorAsset;
  dir: DungeonDir;
};
export class Dungeon<Rooms extends string> extends Renderer {
  private collisionObjects: Object3D[] = []
  private collisionRaycaster = new Raycaster(undefined, undefined, undefined, 5);
  private activeItemRaycaster = new Raycaster(undefined, undefined, undefined, 1.8);
  private readonly activeItemRayCasterCoords = { x: 0, y: 0 };
  private reusableVec = new Vector3();

  private keys = {
    forward: false,
    back: false,
    left: false,
    right: false
  }

  private controls = new PointerLockControls(this.camera, this.renderer.domElement)

  private interActableObjects: InterActableObject[] = []
  private activeObj?: InterActableObject

  private fightCon?: FightController;
  private currentRoom: DungeonRoom<Rooms>

  private playerChar: Character = {
    class: 'base',
    items: { weapon: 'BasicSword' }
  }

  private ui = new DungeonUI()
  private inventory: Inventory = {
    items: [],
    size: 12
  };
  private inventoryUI = new InventoryUI(this.inventory, this.playerChar)

  constructor(private rooms: DungeonRooms<Rooms>, firstRoom: Rooms, entryDir: DungeonDir) {
    super(0.01)
    this.currentRoom = this.rooms[firstRoom]
    this.load(this.rooms[firstRoom], entryDir);
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
  exit() {
    this.disposeRenderer();
    this.removeListeners()
  }

  private async load(dungeonRoom: DungeonRoom<Rooms>, dir: DungeonDir) {
    this.currentRoom = dungeonRoom
    this.reset()
    this.setCamera(dir);
    const manager = new LoadingManager();
    LoaderUI(manager, `Loading Dungeon Room ${dungeonRoom.name}`)

    const loader = getGLTFLoader(manager)

    const [room, roomItems, doors, fight] = await Promise.all([
      loadRoom(dungeonRoom.name, manager, loader),
      Promise.all(this.extractRoomItemPromisees(dungeonRoom, loader)),
      Promise.all(this.extractRoomDoorPromisees(dungeonRoom, loader)),
      dungeonRoom.fight ? Promise.all([loadCharacter(loader, this.playerChar), loadCharacter(loader, dungeonRoom.fight.char)]) : undefined
    ])

    this.ui.show()

    this.scene.add(room.scene);
    this.scene.environment = room.background || null;
    this.collisionObjects.push(...room.collisions);

    this.addRoomItems(roomItems)

    this.addRoomDoor(dungeonRoom, doors);

    if (fight) {
      this.controls.unlock()
      const ui = new FightUI()
      const [playerChar1, playerChar2] = fight

      const players: Record<Player, CharacterController> = {
        player1: new CharacterController('player1', ui, playerChar1),
        player2: new CharacterController('player2', ui, playerChar2)
      }
      this.scene.add(players.player1.model);
      this.scene.add(players.player2.model);

      this.fightCon = new FightController(players, ui, 'player1', this, {
        exitToMainMenu: () => { console.log('TODO exit to main menu') },
        customEndScreen: async (victory, dispose, endScreen) => {
          if (victory) {
            victoryOrLossUI(victory)
            await wait(1500)
            this.camera.removeFromParent();
            this.setCamera(dir);
            this.fightCon = undefined;
            this.scene.remove(players.player1.model);
            // this.scene.remove(players.player2.model);

            const dungeonFight = dungeonRoom.fight!
            dungeonRoom.fight = undefined

            const loot: Inventory = { items: [...(dungeonFight.loot?.items || []), ...this.characterItemsToArray(dungeonFight.char)] }
            const newRoomItem: RoomItemInfoAndAsset = { asset: await loadRoomItem(loader, 'enemy'), info: { asset: 'enemy', items: loot, removeIfEmpty: true } };
            this.ui.show()

            this.inventoryUI.show({ name: 'Fight', inventory: loot }, () => {
              if (!this.areItemsEmpty(newRoomItem.info.items!.items)) {
                dungeonRoom.objectInfos.push(newRoomItem.info)
                this.addRoomItems([newRoomItem])
              }
            })

            dispose()
          } else {
            endScreen()
          }

        }
      })
    }
    this.updateRenderer(0);
  }

  private extractRoomItemPromisees(dungeonRoom: DungeonRoom<Rooms>, loader: GLTFLoader) {
    const roomItemPromises: Promise<RoomItemInfoAndAsset>[] = [];

    for (let i = 0; i < dungeonRoom.objectInfos.length; i++) {
      const info = dungeonRoom.objectInfos[i];
      roomItemPromises.push(new Promise(async (res) => {
        res({
          asset: await loadRoomItem(loader, info.asset),
          info: info
        });
      }));
    }
    return roomItemPromises
  }

  private extractRoomDoorPromisees(dungeonRoom: DungeonRoom<Rooms>, loader: GLTFLoader) {
    const roomDoorPromises: Promise<RoomDoorAssetAndDir>[] = [];
    for (const key in dungeonRoom.doors) {
      if (Object.prototype.hasOwnProperty.call(dungeonRoom.doors, key)) {
        const door = dungeonRoom.doors[key as DungeonDir];
        if (door) {

          roomDoorPromises.push(new Promise(async (res) => {
            res({
              asset: await loadRoomDoor(loader, door.asset),
              dir: key as DungeonDir,
            });
          }));
        }
      }
    }

    return roomDoorPromises
  }

  private addRoomItems(roomItems: RoomItemInfoAndAsset[]) {
    for (let i = 0; i < roomItems.length; i++) {
      const { asset, info } = roomItems[i];
      this.scene.add(asset.scene)
      if (info.position) {
        const { x, y, z } = info.position;
        asset.scene.position.set(x, y, z)
      }
      if (info.rotation) {
        const { x, y, z } = info.rotation;
        asset.scene.rotation.set(x, y, z)
      }
      this.collisionObjects.push(asset.collision);
      this.interActableObjects.push({
        func: (self) => {
          if (self.loot) {
            this.controls.unlock()
            this.inventoryUI.show({ inventory: self.loot, name: self.name }, () => {
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
    for (let i = 0; i < doors.length; i++) {
      const { asset, dir } = doors[i];
      const door = dungeonRoom.doors[dir]!
      this.scene.add(asset.scene)
      this.collisionObjects.push(asset.collision);
      asset.scene.rotateY(dirToRadians(dir));
      asset.scene.translateZ(-5);
      this.interActableObjects.push({
        scene: asset.scene,
        collision: asset.collision,
        name: door.type === 'exit' ? 'Exit ' + dir : door.roomId + ' ' + dir,
        func: () => {
          if (door.type === 'exit') {
            console.log('EXIT (TODO)');
          } else {
            this.load(this.rooms[door.roomId], dir);
          }
        }
      })
    }
  }

  private setCamera(dir: DungeonDir) {
    this.camera.near = 0.01
    this.camera.updateProjectionMatrix()
    this.camera.rotation.set(0, dirToRadians(dir) + degToRad(180), 0);
    this.camera.position.set(0, 1.6, 0);
    this.camera.translateZ(-4)
    this.camera.rotateY(degToRad(180))
  }

  private reset() {
    this.collisionObjects = [];
    this.interActableObjects = []
    this.scene.clear()
  }

  update(delta: number) {
    const timeElapsedSeconds = (delta - this.previousRAF) * 0.001;
    if (this.fightCon) {
      this.fightCon.update(timeElapsedSeconds)
    } else {
      this.updateMovement(timeElapsedSeconds);

      this.setActiveObject();
    }
  }

  private setActiveObject() {
    this.activeItemRaycaster.setFromCamera(this.activeItemRayCasterCoords, this.camera);
    const intersections = this.activeItemRaycaster.intersectObjects(this.collisionObjects);

    let closestObj: { i: InterActableObject; dist: number; } | undefined;

    for (let i = 0; i < intersections.length; i++) {
      const intersection = intersections[i];
      const interActableItem = this.interActableObjects.find((item) => item.collision === intersection.object);
      if (interActableItem) {
        if (!closestObj || closestObj.dist > intersection.distance) {
          closestObj = { i: interActableItem, dist: intersection.distance };
        }
      }
    }

    if (this.activeObj !== closestObj?.i) {
      this.activeObj = closestObj?.i;
      if (this.activeObj) {
        this.ui.showActiveObject(`[${getKeybinding('Dungeon', 'Interact')}] - ${this.activeObj.name}`);
      } else {
        this.ui.showActiveObject('');
      }
    }
  }

  private updateMovement(timeElapsedSeconds: number) {
    const speed = 3 * timeElapsedSeconds;
    if (this.keys.forward) {
      this.reusableVec.setFromMatrixColumn(this.camera.matrix, 0);
      this.reusableVec.crossVectors(this.camera.up, this.reusableVec);
      if (this.checkCollision(this.camera.position, this.reusableVec)) {
        this.controls.moveForward(speed);
      }
    }
    if (this.keys.back) {
      this.reusableVec.setFromMatrixColumn(this.camera.matrix, 0);
      this.reusableVec.crossVectors(this.reusableVec, this.camera.up);
      if (this.checkCollision(this.camera.position, this.reusableVec)) {
        this.controls.moveForward(-speed);
      }
    }
    if (this.keys.right) {
      this.reusableVec.setFromMatrixColumn(this.camera.matrix, 1);
      this.reusableVec.crossVectors(this.reusableVec, this.camera.up);
      if (this.checkCollision(this.camera.position, this.reusableVec)) {
        this.controls.moveRight(speed);
      }
    }
    if (this.keys.left) {
      this.reusableVec.setFromMatrixColumn(this.camera.matrix, 1);
      this.reusableVec.crossVectors(this.camera.up, this.reusableVec);
      if (this.checkCollision(this.camera.position, this.reusableVec)) {
        this.controls.moveRight(-speed);
      }
    }
  }

  private checkCollision(pos: Vector3, dir: Vector3) {

    this.collisionRaycaster.set(pos, dir);

    const interSections = this.collisionRaycaster.intersectObjects(this.collisionObjects);

    if (interSections.length > 0) {
      for (let i = 0; i < interSections.length; i++) {
        const intersection = interSections[i];

        if (intersection.distance < 0.3) {
          return false
        }
      }
    }
    return true
  }

  private click = () => {
    if (!this.fightCon && !this.inventoryUI.visible) {
      this.controls.lock();
    }
  }

  private keydown = (e: KeyboardEvent) => {
    if (!this.fightCon) {
      if (e.key.toUpperCase() === getKeybinding('Dungeon', 'ToggleInventory')) {
        e.preventDefault()
        if (this.inventoryUI.visible) {
          this.inventoryUI.hide()
          this.controls.lock()
        } else {
          this.controls.unlock()
          this.inventoryUI.show()
        }
      }

      if (this.inventoryUI.visible) return;

      switch (e.key.toUpperCase()) {
        case getKeybinding('Dungeon', 'MoveForward'):
          this.keys.forward = true;
          break;
        case getKeybinding('Dungeon', 'MoveBack'):
          this.keys.back = true;
          break;
        case getKeybinding('Dungeon', 'MoveLeft'):
          this.keys.left = true;
          break;
        case getKeybinding('Dungeon', 'MoveRight'):
          this.keys.right = true;
          break;
        case getKeybinding('Dungeon', 'Interact'):
          if (this.activeObj) {
            this.activeObj.func(this.activeObj);
          }
          break;
      }
    }
  }

  private keyup = (e: KeyboardEvent) => {
    switch (e.key.toUpperCase()) {
      case getKeybinding('Dungeon', 'MoveForward'):
        this.keys.forward = false;
        break;
      case getKeybinding('Dungeon', 'MoveBack'):
        this.keys.back = false;
        break;
      case getKeybinding('Dungeon', 'MoveLeft'):
        this.keys.left = false;
        break;
      case getKeybinding('Dungeon', 'MoveRight'):
        this.keys.right = false;
        break;
    }
  }

  private areItemsEmpty(items: Inventory['items']) {
    let areItemsEmpty = true;
    items.forEach(item => {
      if (item) {
        areItemsEmpty = false;
      }
    });
    return areItemsEmpty;
  }

  private characterItemsToArray(char: Character) {
    const items: ItemName[] = []
    for (const key in char.items) {
      if (Object.prototype.hasOwnProperty.call(char.items, key)) {
        const item = char.items[key as keyof Character['items']];
        if (item) {
          items.push(item)
        }
      }
    }
    return items
  }
}
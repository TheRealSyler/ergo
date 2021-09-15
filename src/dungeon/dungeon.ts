import { Renderer } from '../renderer';
import { Object3D, Raycaster, Vector3, LoadingManager } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { loadRoom } from '../rooms/rooms';
import { DungeonDoor, DungeonRoom, DungeonRooms, RoomItemInfo } from './dungeonRoom';
import { LoaderUI } from '../ui/loaderUI';
import { Character } from '../character/character';
import { loadCharacter } from '../character/loadCharacter';
import { dirToRadians, getGLTFLoader } from '../utils';
import { FightController } from '../fight/fightController';
import { FightUI } from '../ui/fightUI';
import { CharacterController } from '../character/characterController';
import { Player } from '../game';
import { loadRoomItem, RoomItemAsset } from './dungeonRoomItem';
import { DungeonUI } from '../ui/dungeonUI';
import { degToRad } from 'three/src/math/MathUtils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { loadRoomDoor, RoomDoorAsset } from './doors';
import { Inventory, InventoryUI } from '../ui/inventoryUI';


interface InterActableObject {
  collision: Object3D;
  name: string
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

  private playerChar: Character = {
    class: 'base',
    items: {}
  }

  private ui = new DungeonUI()
  private inventory: Inventory = {
    items: [],
    size: 12
  };
  private inventoryUI = new InventoryUI(this.inventory, this.playerChar)

  constructor(private rooms: DungeonRooms<Rooms>, firstRoom: Rooms, entryDir: DungeonDir) {
    super(0.01)

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
    this.reset()
    this.setCamera(dir);
    const manager = new LoadingManager();
    LoaderUI(manager, `Loading Dungeon Room ${dungeonRoom.name}`)

    const loader = getGLTFLoader(manager)

    const [room, roomItems, doors, fight] = await Promise.all([
      loadRoom(dungeonRoom.name, manager, loader),
      Promise.all(this.extractRoomItemPromisees(dungeonRoom, loader)),
      Promise.all(this.extractRoomDoorPromisees(dungeonRoom, loader)),
      dungeonRoom.fight ? Promise.all([loadCharacter(loader, this.playerChar), loadCharacter(loader, dungeonRoom.fight)]) : undefined
    ])

    this.ui.show()

    this.scene.add(room.scene);
    this.scene.environment = room.background || null;
    this.collisionObjects.push(...room.collisions);

    this.loadRoomItems(roomItems)

    this.loadRoomDoor(dungeonRoom, doors);

    if (fight) {
      this.controls.disconnect()
      this.controls.unlock()
      const ui = new FightUI()
      const [playerChar1, playerChar2] = fight

      const players: Record<Player, CharacterController> = {
        player1: new CharacterController('player1', ui, playerChar1),
        player2: new CharacterController('player2', ui, playerChar2)
      }
      this.scene.add(players.player1.model);
      this.scene.add(players.player2.model);
      const endOfFight = () => {
        this.ui.show()
        this.fightCon = undefined;
        this.camera.removeFromParent();
        this.scene.remove(players.player1.model);
        // this.scene.remove(players.player2.model);
        this.setCamera(dir);
        this.controls.connect()

      }
      this.fightCon = new FightController(endOfFight, players, ui, 'player1', this)
    }
    this.updateRenderer(0);
  }

  private extractRoomItemPromisees(dungeonRoom: DungeonRoom<Rooms>, loader: GLTFLoader) {
    const roomItemPromises: Promise<RoomItemInfoAndAsset>[] = [];

    for (let i = 0; i < dungeonRoom.objects.length; i++) {
      const object = dungeonRoom.objects[i];
      roomItemPromises.push(new Promise(async (res) => {
        res({
          asset: await loadRoomItem(loader, object.asset),
          info: object
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

  private loadRoomItems(roomItems: RoomItemInfoAndAsset[]) {
    for (let i = 0; i < roomItems.length; i++) {
      const item = roomItems[i];
      this.scene.add(item.asset.scene)
      if (item.info.position) {
        const { x, y, z } = item.info.position;
        item.asset.scene.position.set(x, y, z)
      }
      if (item.info.rotation) {
        const { x, y, z } = item.info.rotation;
        item.asset.scene.rotation.set(x, y, z)
      }
      this.collisionObjects.push(item.asset.collision);
      this.interActableObjects.push({
        func: (self) => {
          if (item.info.items) {
            this.controls.unlock()
            this.inventoryUI.show({ inventory: item.info.items, name: self.name })
          }
        },
        name: 'Chest',
        collision: item.asset.collision
      })
    }
  }

  private loadRoomDoor(dungeonRoom: DungeonRoom<Rooms>, doors: RoomDoorAssetAndDir[]) {
    for (let i = 0; i < doors.length; i++) {
      const { asset, dir } = doors[i];
      const door = dungeonRoom.doors[dir]!
      this.scene.add(asset.scene)
      this.collisionObjects.push(asset.collision);
      asset.scene.rotateY(dirToRadians(dir));
      asset.scene.translateZ(-5);
      this.interActableObjects.push({
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
        this.ui.showActiveObject(this.activeObj.name);
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
    if (e.key === 'Tab') {
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

    switch (e.key) {
      case 'w':
      case 'W':
        this.keys.forward = true;
        break;
      case 's':
      case 'S':
        this.keys.back = true;
        break;
      case 'a':
      case 'A':
        this.keys.left = true;
        break;
      case 'd':
      case 'D':
        this.keys.right = true;
        break;
      case 'e':
      case 'E':
        if (this.activeObj) {
          this.activeObj.func(this.activeObj);
        }
        break;
    }
  }

  private keyup = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'w':
      case 'W':
        this.keys.forward = false;
        break;
      case 's':
      case 'S':
        this.keys.back = false;
        break;
      case 'a':
      case 'A':
        this.keys.left = false;
        break;
      case 'd':
      case 'D':
        this.keys.right = false;
        break;
    }
  }
}
import { Renderer } from '../renderer';
import { Object3D, Raycaster, Vector3, LoadingManager, Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { loadRoom } from '../rooms/rooms';

import { DungeonRoom, DoorDir, DungeonRooms, RoomItemInfo } from './dungeonRoom';
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
import { degToRad, radToDeg } from 'three/src/math/MathUtils';


interface InterActableObject {
  collision: Object3D;
  name: string
  func: (self: InterActableObject) => void
}

export class Dungeon<Rooms extends string> extends Renderer {
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

  private collisionObjects: Object3D[] = []
  private controls = new PointerLockControls(this.camera, this.renderer.domElement)

  private interActableObjects: InterActableObject[] = []

  private activeObj?: InterActableObject

  private fightCon?: FightController;

  private playerChar: Character = {
    class: 'base',
    items: { gloves: 'BasicGloves', weapon: 'BasicSword' }
  }

  private ui = new DungeonUI()

  constructor(private rooms: DungeonRooms<Rooms>, firstRoom: Rooms) {
    super(0.01)

    this.load(this.rooms[firstRoom], 'north');

    window.addEventListener('click', () => {
      if (!this.fightCon) {
        this.controls.lock()
      }
    })


    window.addEventListener('keydown', e => {
      switch (e.key) {
        case 'w':
        case 'W':
          this.keys.forward = true
          break;
        case 's':
        case 'S':
          this.keys.back = true
          break;
        case 'a':
        case 'A':
          this.keys.left = true
          break;
        case 'd':
        case 'D':
          this.keys.right = true
          break;
        case 'e':
        case 'E':
          if (this.activeObj) {
            this.activeObj.func(this.activeObj)
          }
          break;
      }
    })
    window.addEventListener('keyup', e => {
      switch (e.key) {
        case 'w':
        case 'W':
          this.keys.forward = false
          break;
        case 's':
        case 'S':
          this.keys.back = false
          break;
        case 'a':
        case 'A':
          this.keys.left = false
          break;
        case 'd':
        case 'D':
          this.keys.right = false
          break;
      }
    })

  }

  private async load(dungeonRoom: DungeonRoom<Rooms>, dir: DoorDir) {
    this.reset()
    const manager = new LoadingManager();
    LoaderUI(manager, `Loading Dungeon Room ${dungeonRoom.name}`)

    this.setCamera(dir);
    const loader = getGLTFLoader(manager)

    const roomItemPromises: Promise<{ asset: RoomItemAsset, info: RoomItemInfo }>[] = [];

    for (let i = 0; i < dungeonRoom.objects.length; i++) {
      const object = dungeonRoom.objects[i];
      roomItemPromises.push(new Promise(async (res) => {
        res({
          asset: await loadRoomItem(loader, object.asset),
          info: object
        })
      }))
    }

    const [room, roomItems, playerChars] = await Promise.all([
      loadRoom(dungeonRoom.name, manager, loader),
      Promise.all(roomItemPromises),
      dungeonRoom.fight ? Promise.all([loadCharacter(loader, this.playerChar), loadCharacter(loader, dungeonRoom.fight)]) : undefined
    ])

    this.ui.show()

    this.scene.add(room.scene);
    this.scene.environment = room.background || null;

    this.collisionObjects.push(...room.collisions);

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
          console.log('TODO OPEN Inventory')
        },
        name: 'Chest',
        collision: item.asset.collision
      })
    }
    for (const key in dungeonRoom.doors) {
      if (Object.prototype.hasOwnProperty.call(dungeonRoom.doors, key)) {
        const door = dungeonRoom.doors[key as DoorDir];
        if (door) {

          const interActable: InterActableObject = {

            collision: new Mesh(new BoxGeometry(1, 1), new MeshBasicMaterial({
              color: 0x0fffff
            })),
            name: door.type === 'exit' ? 'Exit ' + key : door.roomId + ' ' + key,
            func: () => {
              if (door.type === 'exit') {
                console.log('EXIT (TODO)');
              } else {
                this.load(this.rooms[door.roomId], key as DoorDir);
              }
            }
          };
          this.scene.add(interActable.collision);
          this.collisionObjects.push(interActable.collision)
          interActable.collision.rotateY(dirToRadians(key as DoorDir))
          interActable.collision.translateZ(-4.5)
          interActable.collision.translateY(0.5)

          this.interActableObjects.push(interActable);
        }

      }
    }
    if (playerChars) {
      this.controls.disconnect()
      this.controls.unlock()
      const ui = new FightUI()
      const [playerChar1, playerChar2] = playerChars

      const players: Record<Player, CharacterController> = {
        player1: new CharacterController('player1', ui, playerChar1),
        player2: new CharacterController('player2', ui, playerChar2)
      }
      this.scene.add(players.player1.model);
      this.scene.add(players.player2.model);
      this.fightCon = new FightController(() => {
        this.ui.show()
        this.fightCon = undefined;
        this.camera.removeFromParent();
        this.scene.remove(players.player1.model);
        // this.scene.remove(players.player2.model);
        this.setCamera(dir);
        this.controls.connect()

      }, players, ui, 'player1', this)
    }
    this.updateRenderer(0);
  }
  private setCamera(dir: DoorDir) {
    this.camera.near = 0.01
    this.camera.updateProjectionMatrix()
    this.camera.rotation.set(0, dirToRadians(dir) + degToRad(180), 0);
    this.camera.position.set(0, 1.6, 0);
    this.camera.translateZ(-4)
    this.camera.rotateY(degToRad(180))

  }

  reset() {
    this.collisionObjects = [];
    this.interActableObjects = []
    this.scene.clear()
  }
  update(delta: number) {
    const timeElapsedSeconds = (delta - this.previousRAF) * 0.001;
    if (this.fightCon) {
      this.fightCon.update(timeElapsedSeconds)
    } else {
      this.updateDungeonLogic(timeElapsedSeconds)
    }
  }
  updateDungeonLogic(timeElapsedSeconds: number) {
    const speed = 3 * timeElapsedSeconds
    if (this.keys.forward) {
      this.reusableVec.setFromMatrixColumn(this.camera.matrix, 0);
      this.reusableVec.crossVectors(this.camera.up, this.reusableVec);
      if (this.checkCollision(this.camera.position, this.reusableVec)) {
        this.controls.moveForward(speed)
      }
    }
    if (this.keys.back) {
      this.reusableVec.setFromMatrixColumn(this.camera.matrix, 0);
      this.reusableVec.crossVectors(this.reusableVec, this.camera.up);
      if (this.checkCollision(this.camera.position, this.reusableVec)) {
        this.controls.moveForward(-speed)
      }
    }
    if (this.keys.right) {
      this.reusableVec.setFromMatrixColumn(this.camera.matrix, 1);
      this.reusableVec.crossVectors(this.reusableVec, this.camera.up);
      if (this.checkCollision(this.camera.position, this.reusableVec)) {
        this.controls.moveRight(speed)
      }
    }
    if (this.keys.left) {
      this.reusableVec.setFromMatrixColumn(this.camera.matrix, 1);
      this.reusableVec.crossVectors(this.camera.up, this.reusableVec);
      if (this.checkCollision(this.camera.position, this.reusableVec)) {
        this.controls.moveRight(-speed)
      }
    }

    this.activeItemRaycaster.setFromCamera(this.activeItemRayCasterCoords, this.camera)
    const intersections = this.activeItemRaycaster.intersectObjects(this.collisionObjects)

    let closestObj: { i: InterActableObject, dist: number } | undefined;

    for (let i = 0; i < intersections.length; i++) {
      const intersection = intersections[i];
      const interActableItem = this.interActableObjects.find((item) => item.collision === intersection.object);
      if (interActableItem) {
        if (!closestObj || closestObj.dist > intersection.distance) {
          closestObj = { i: interActableItem, dist: intersection.distance }
        }
      }
    }

    if (this.activeObj !== closestObj?.i) {
      this.activeObj = closestObj?.i
      if (this.activeObj) {
        this.ui.showActiveObject(this.activeObj.name)
      } else {
        this.ui.showActiveObject('')
      }
    }
  }

  private checkCollision(pos: Vector3, dir: Vector3) {

    this.collisionRaycaster.set(pos, dir);

    const interSections = this.collisionRaycaster.intersectObjects(this.collisionObjects);

    if (interSections.length > 0) {
      for (let i = 0; i < interSections.length; i++) {
        const intersection = interSections[i];
        // this.addArrow(intersection)

        if (intersection.distance < 0.3) {
          return false
        }
      }
    }
    return true
  }
  // private arrows: ArrowHelper[] = []
  // private addArrow(intersection: Intersection) {
  //   if (this.arrows.length > 10) {
  //     this.arrows.shift()!.removeFromParent();
  //   }
  //   this.raycasterVec.copy(this.camera.position);
  //   this.arrows.push(new ArrowHelper(this.raycasterVec.subVectors(intersection.point, this.raycasterVec), this.camera.position, intersection.distance, new Color('red')));
  //   this.scene.add(this.arrows[this.arrows.length - 1]);
  // }

}
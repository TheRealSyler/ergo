import { Renderer } from '../renderer';
import { Object3D, Raycaster, Vector2, Vector3, LoadingManager, Mesh, BoxGeometry, MeshBasicMaterial, Box3, TextGeometry, Font, Group } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { loadRoom } from '../rooms/rooms';

import fontLocation from '../assets/font.json'
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

interface InterActableObject {
  obj: Object3D;
  name: string
  func: (self: InterActableObject) => void
}

export class Dungeon<Rooms extends string> extends Renderer {

  raycaster = new Raycaster(undefined, undefined, undefined, 5);
  raycasterVec = new Vector3();
  mouse = new Vector2(1, 1);

  keys = {
    forward: false,
    back: false,
    left: false,
    right: false
  }
  collisionObjects: Object3D[] = []
  controls = new PointerLockControls(this.camera, this.renderer.domElement)
  interActableObjects: InterActableObject[] = []
  activeObj?: InterActableObject

  font = new Font(fontLocation)

  fightCon?: FightController;

  playerChar: Character = {
    class: 'base',
    items: { gloves: 'BasicGloves', weapon: 'BasicSword' }
  }

  ui = new DungeonUI()

  private readonly itemActivationDistance = 2;

  constructor(private rooms: DungeonRooms<Rooms>, firstRoom: Rooms) {
    super(0.01)

    this.load(this.rooms[firstRoom]);

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

  private async load(dungeonRoom: DungeonRoom<Rooms>) {
    this.reset()
    const manager = new LoadingManager();
    LoaderUI(manager, `Loading Dungeon Room ${dungeonRoom.name}`)

    this.setCamera();
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
      this.collisionObjects.push(...item.asset.collisions);
      this.interActableObjects.push({
        func: (self) => {
          console.log('TODO OPEN Inventory')
        },
        name: 'Chest',
        obj: item.asset.scene
      })
    }
    for (const key in dungeonRoom.doors) {
      if (Object.prototype.hasOwnProperty.call(dungeonRoom.doors, key)) {
        const door = dungeonRoom.doors[key as DoorDir];
        if (door) {

          const interActable: InterActableObject = {

            obj: new Mesh(new BoxGeometry(1, 1), new MeshBasicMaterial({
              color: 0x0fffff
            })),
            name: door.type === 'exit' ? 'Exit ' + key : door.roomId + ' ' + key,
            func: () => {
              if (door.type === 'exit') {
                console.log('EXIT (TODO)');
              } else {
                this.load(this.rooms[door.roomId]);
              }
            }
          };
          this.scene.add(interActable.obj);

          interActable.obj.rotateY(dirToRadians(key as DoorDir))
          interActable.obj.translateZ(-4.5)
          interActable.obj.translateY(0.5)

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
        this.setCamera();
        this.controls.connect()

      }, players, ui, 'player1', this)
    }
    this.updateRenderer(0);
  }
  private setCamera() {
    this.camera.near = 0.01
    this.camera.updateProjectionMatrix()
    this.camera.position.set(0, 1.6, 0);
    this.camera.rotation.set(0, 0, 0);

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
      this.raycasterVec.setFromMatrixColumn(this.camera.matrix, 0);
      this.raycasterVec.crossVectors(this.camera.up, this.raycasterVec);
      if (this.checkCollision(this.camera.position, this.raycasterVec)) {
        this.controls.moveForward(speed)
      }
    }
    if (this.keys.back) {
      this.raycasterVec.setFromMatrixColumn(this.camera.matrix, 0);
      this.raycasterVec.crossVectors(this.raycasterVec, this.camera.up);
      if (this.checkCollision(this.camera.position, this.raycasterVec)) {
        this.controls.moveForward(-speed)
      }
    }
    if (this.keys.right) {
      this.raycasterVec.setFromMatrixColumn(this.camera.matrix, 1);
      this.raycasterVec.crossVectors(this.raycasterVec, this.camera.up);
      if (this.checkCollision(this.camera.position, this.raycasterVec)) {
        this.controls.moveRight(speed)
      }
    }
    if (this.keys.left) {
      this.raycasterVec.setFromMatrixColumn(this.camera.matrix, 1);
      this.raycasterVec.crossVectors(this.camera.up, this.raycasterVec);
      if (this.checkCollision(this.camera.position, this.raycasterVec)) {
        this.controls.moveRight(-speed)
      }
    }

    let closestObj: { i: InterActableObject, dist: number } | undefined;

    for (let i = 0; i < this.interActableObjects.length; i++) {
      const interActable = this.interActableObjects[i];

      const distance = interActable.obj.position.distanceTo(this.camera.position)
      if (distance < this.itemActivationDistance) {
        if (!closestObj || closestObj.dist > distance) {
          closestObj = { i: interActable, dist: distance }
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

    this.raycaster.set(pos, dir);

    const interSections = this.raycaster.intersectObjects(this.collisionObjects);

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
  // arrows: ArrowHelper[] = []
  // private addArrow(intersection: Intersection) {
  //   if (this.arrows.length > 10) {
  //     this.arrows.shift()!.removeFromParent();
  //   }
  //   this.raycasterVec.copy(this.camera.position);
  //   this.arrows.push(new ArrowHelper(this.raycasterVec.subVectors(intersection.point, this.raycasterVec), this.camera.position, intersection.distance, new Color('red')));
  //   this.scene.add(this.arrows[this.arrows.length - 1]);
  // }

}
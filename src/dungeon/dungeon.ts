import { Renderer } from '../renderer';
import { MAIN_UI_ELEMENT } from '../ui/ui';
import { Object3D, Raycaster, Vector2, Vector3, LoadingManager, Mesh, BoxGeometry, MeshBasicMaterial, Box3, TextGeometry, Font, Group } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { loadRoom } from '../rooms/rooms';

import fontLocation from '../assets/font.json'
import { degToRad } from 'three/src/math/MathUtils';
import { DungeonRoom, DoorDir } from './dungeonRoom';
import { LoaderUI } from '../ui/loaderUI';
import { loadObstacle, Obstacle } from '../rooms/roomObstacles';

interface InterActableObject {
  obj: Object3D;
  name: string
  dist: number;
  func: () => void
}

export class Dungeon extends Renderer {

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
  activeObjUi: Object3D
  font = new Font(fontLocation)
  constructor(private room: DungeonRoom) {
    super(0.01)
    MAIN_UI_ELEMENT.textContent = '';


    this.activeObjUi = new Group()
    this.activeObjUi.translateY(-1)


    this.load(this.room);
    window.addEventListener('click', () => this.controls.lock())


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
            this.activeObj.func()
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

  private async load(dungeonRoom: DungeonRoom) {
    this.reset()
    const manager = new LoadingManager();
    LoaderUI(manager, `Loading Dungeon Room ${dungeonRoom.name}`)

    this.camera.position.set(0, 0.9, 0);
    this.scene.add(this.activeObjUi)

    const obstaclePromises: Promise<Obstacle>[] = []
    for (let i = 0; i < dungeonRoom.obstacles.length; i++) {
      const obstacle = dungeonRoom.obstacles[i];
      obstaclePromises.push(loadObstacle(obstacle, manager));
    }

    const [room, obstacles] = await Promise.all([loadRoom(dungeonRoom.name, manager), Promise.all(obstaclePromises)])
    MAIN_UI_ELEMENT.textContent = '';
    for (let i = 0; i < obstacles.length; i++) {
      const obstacle = obstacles[i];
      this.scene.add(obstacle.obj)
      this.collisionObjects.push(...obstacle.collisions)
    }

    this.scene.add(room.scene);
    this.scene.environment = room.background || null;
    if (room.collisions) {
      this.collisionObjects.push(...room.collisions);
    }

    this.updateRenderer(0);

    for (const key in dungeonRoom.doors) {
      if (Object.prototype.hasOwnProperty.call(dungeonRoom.doors, key)) {
        const door = dungeonRoom.doors[key as DoorDir];
        if (door) {

          const interActable: InterActableObject = {
            dist: 2,
            obj: new Mesh(new BoxGeometry(1, 1), new MeshBasicMaterial({
              color: 0x0fffff
            })),
            name: door.type === 'exit' ? 'Exit ' + key : door.room.name + ' ' + key + ' ' + door.room._count,
            func: () => {
              if (door.type === 'exit') {
                console.log('EXIT (TODO)');
              } else {
                this.load(door.room);
              }
            }
          };
          this.scene.add(interActable.obj);

          interActable.obj.rotateY(this.dirToRadians(key as DoorDir))
          interActable.obj.translateZ(-4.5)
          interActable.obj.translateY(0.5)

          this.interActableObjects.push(interActable);
        }

      }
    }

  }
  reset() {
    MAIN_UI_ELEMENT.textContent = '';
    this.collisionObjects = [];
    this.interActableObjects = []
    this.scene.clear()
  }
  update(delta: number) {
    const timeElapsedSeconds = (delta - this.previousRAF) * 0.001;
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
      if (distance < interActable.dist) {
        if (!closestObj || closestObj.dist > distance) {
          closestObj = { i: interActable, dist: distance }
        }
      }
    }

    if (this.activeObj !== closestObj?.i) {
      this.activeObj = closestObj?.i
      if (this.activeObj) {
        const activeObjBounds = new Box3().setFromObject(this.activeObj.obj);
        this.activeObjUi.position.set(this.activeObj.obj.position.x, activeObjBounds.max.y + 0.2, this.activeObj.obj.position.z);
        // TODO draw text on canvas and use a plain with the text of the canvas as texture.
        const m = new Mesh(new TextGeometry(this.activeObj.name, { font: this.font, size: 0.1, height: 0.01, }), new MeshBasicMaterial({ color: 0xffffff }))
        const textBounds = new Box3().setFromObject(m);
        // console.log(this.activeObjUi.children)
        m.translateX(-(textBounds.max.x / 2))
        this.activeObjUi.children.forEach((o) => o.removeFromParent())
        this.activeObjUi.add(m)

        // m.translateY(1)
      } else {
        this.activeObjUi.position.set(0, -1, 0)
      }
    }

    if (this.activeObj) {
      this.activeObjUi.lookAt(this.camera.position)
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

  private dirToRadians(dir: DoorDir) {
    switch (dir) {
      case 'north':
        return 0
      case 'east':
        return degToRad(90)
      case 'west':
        return degToRad(-90)
      case 'south':
        return degToRad(180)

    }
  }
}
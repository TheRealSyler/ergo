import { Renderer } from '../renderer';
import { MAIN_UI_ELEMENT } from '../ui/ui';
import { Object3D, Raycaster, Vector2, Vector3, LoadingManager, Mesh, BoxGeometry, MeshBasicMaterial, ArrowHelper, Color, Intersection, Box3, TextGeometry, Font, FontLoader, Group, Clock } from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { loadRoom, RoomNames } from '../rooms';

import fontLocation from '../assets/font.json'

interface DungeonMap {
}
interface InterActableObject {
  obj: Object3D;
  name: string
  dist: number;
  func: () => void
}

export class Dungeon extends Renderer {
  map: DungeonMap = {

  }
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
  constructor() {
    super(0.01)
    MAIN_UI_ELEMENT.textContent = '';


    this.activeObjUi = new Group()
    this.activeObjUi.translateY(-1)


    this.load('test');
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

  private load(roomName: RoomNames) {
    this.camera.position.set(0, 0.9, 0);
    this.scene.add(this.activeObjUi)
    const manager = new LoadingManager();
    const room = loadRoom(roomName, manager);
    manager.onLoad = () => {
      this.scene.add(room.scene);
      this.scene.environment = room.background || null;
      if (room.collisions) {
        this.collisionObjects.push(...room.collisions);
      }
      this.updateRenderer(0);
    };

    const a = new Mesh(new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial({
      color: 0xffffff
    }));
    this.interActableObjects.push({
      dist: 2,
      obj: a,
      name: 'awd',
      func: () => console.log('a')
    });
    const a2 = new Mesh(new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial({
      color: 0xffffff
    }));
    this.interActableObjects.push({
      dist: 2,
      obj: a2,
      name: 'awd2',
      func: () => console.log('a2')
    });
    const b = new Mesh(new BoxGeometry(1, 1), new MeshBasicMaterial({
      color: 0x0fffff
    }));
    this.interActableObjects.push({
      dist: 2,
      obj: b,
      name: 'b',
      func: () => {
        this.reset()
        this.load(roomName === 'basic' ? 'test' : 'basic')
      }
    });

    this.scene.add(a);
    this.scene.add(b);
    a.translateY(0.5);
    a.translateZ(-2);
    this.scene.add(a2);
    a2.translateY(0.5);
    a2.translateZ(-2);
    a2.translateX(1);
    b.translateY(0.5);
    b.translateX(3);

    this.collisionObjects.push(b)
    this.collisionObjects.push(a)
    this.collisionObjects.push(a2)
  }
  reset() {
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
}

import { AxesHelper, Clock, HemisphereLight, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Vector3, WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { degToRad } from 'three/src/math/MathUtils';
import { Player } from './player';
export const loader = new GLTFLoader();
export const camera = new PerspectiveCamera(100, (window.innerWidth / 2) / window.innerHeight, 0.2, 1000);

const camera2 = new PerspectiveCamera(90, (window.innerWidth / 2) / window.innerHeight, 0.1, 1000);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera2, renderer.domElement)

export type Timer = {
  date: number;
  time: number;
  end: () => void;
  tick: (elapsed: number) => void;
};

export const timers = new Set<Timer>();

const scene = new Scene();

document.body.appendChild(renderer.domElement);

const material2 = new MeshBasicMaterial({ color: 0xaaaaaa });
const planeGeo = new PlaneGeometry();
const plane = new Mesh(planeGeo, material2)

plane.rotateX(degToRad(-90))
plane.scale.addScalar(10)
scene.add(plane);

const hemiLight = new HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const axesHelper = new AxesHelper(5);
scene.add(axesHelper);
camera2.position.z = 5;
camera2.position.y = 3;

const clock = new Clock();



const player = new Player(scene, new Vector3(0, 0, 1), true)
const enemy = new Player(scene, new Vector3(0, 0, -1))


const pressedKeys: { [key: string]: boolean } = {}

window.addEventListener('keydown', (e) => {
  pressedKeys[e.key.toLowerCase()] = true
  switch (e.key.toLowerCase()) {
    case 'a':
      if (!e.repeat) {
        player.changeStance('dodge_left');
      }
      break;

    case 'd':
      if (!e.repeat) {
        player.changeStance('dodge_right');
      }
      break;

    case 's':
      if (!e.repeat) {
        player.changeStance('dodge_down');
      }
      break;
    // case 'arrowup': 
    // if (!e.repeat) {
    //   player.attack('attack_up');
    // }
    // break;
    //   case 'arrowdown':
    //     if (!e.repeat) {
    //       player.attack('attack_down');
    //     }
    //     break;

    case 'arrowleft':
      if (!e.repeat) {
        player.attack('attack_left');
      }
      break;
    case 'arrowright':
      if (!e.repeat) {
        player.attack('attack_right');
      }
      break;
  }
});

window.addEventListener('keyup', (e) => {
  pressedKeys[e.key.toLowerCase()] = false
  switch (e.key.toLowerCase()) {
    case 'a':
    case 'd':
    case 's':
      if (!pressedKeys['a'] && !pressedKeys['d'] && !pressedKeys['s']) {
        player.changeStance('idle');
      }
      break;

  }


});

export function animate() {
  requestAnimationFrame(animate);

  const date = performance.now();

  timers.forEach(timer => {
    const endDate = timer.date + timer.time;
    if (date >= endDate) {
      timer.end();
      timers.delete(timer);
    } else {
      timer.tick(timer.time - (endDate - date))
    }
  })

  const mixerUpdateDelta = clock.getDelta();
  if (player.mixer) {
    player.mixer.update(mixerUpdateDelta);
  }
  if (enemy.mixer) {
    enemy.mixer.update(mixerUpdateDelta);
  }
  if (enemy.head) {
    const target = new Vector3();
    enemy.head.getWorldPosition(target)
    camera.lookAt(target)
  }

  renderer.setScissorTest(true);

  renderer.setViewport(0, 0, Math.floor(window.innerWidth / 2), window.innerHeight)
  renderer.setScissor(0, 0, Math.floor(window.innerWidth / 2), window.innerHeight)
  renderer.render(scene, camera);
  renderer.setViewport(Math.floor(window.innerWidth / 2), 0, Math.floor(window.innerWidth / 2), window.innerHeight)
  renderer.setScissor(Math.floor(window.innerWidth / 2), 0, Math.floor(window.innerWidth / 2), window.innerHeight)
  renderer.render(scene, camera2);
}

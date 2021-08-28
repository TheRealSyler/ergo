import './index.sass';
import { AxesHelper, BoxGeometry, Material, Mesh, MeshBasicMaterial, PerspectiveCamera, Plane, PlaneGeometry, Scene, Vector3, WebGLRenderer } from 'three'
import { lerp } from 'three/src/math/MathUtils';

type Timer = {
  date: number;
  time: number;
  end: () => void;
  tick: (elapsed: number) => void;
};

const timers = new Set<Timer>();

class Player {
  stance: PlayerStance = 'idle';
  animation: null | Timer = null;
  animationTime = 100;
  mesh: Mesh;
  weapon: Mesh;
  enemy?: Player;
  constructor(scene: Scene, startPosition: Vector3) {
    const material = new MeshBasicMaterial({ color: 0xaafaaa });
    const geo = new BoxGeometry();
    this.mesh = new Mesh(geo, material);
    this.mesh.position.set(startPosition.x, startPosition.y, startPosition.z);
    scene.add(this.mesh);

    const wMaterial = new MeshBasicMaterial({ color: 0xff4a4a });
    const wGeo = new BoxGeometry();

    this.weapon = new Mesh(wGeo, wMaterial);
    this.weapon.position.set(startPosition.x + 1, startPosition.y, startPosition.z);
    this.weapon.scale.setScalar(0.4);
    scene.add(this.weapon);

  }

  attack(attack: PlayerAttack) {
    const startPosX = this.weapon.position.x;
    const startPosZ = this.weapon.position.z;
    const time = 250
    switch (attack) {
      case 'attack-left':
        timers.add({
          date: performance.now(),
          end: () => {
            this.weapon.position.setX(startPosX);
            this.weapon.position.setZ(startPosZ);

          },
          tick: (elapsed) => {
            const percent = elapsed / time;
            this.weapon.position.setX(lerp(startPosX, 0, percent));
            this.weapon.position.setZ(lerp(startPosZ, 1, percent));

          },
          time: time
        })
        break;

      case 'attack-right':

        break;

    }
  }

  changeStance(state: PlayerStance) {
    if (this.animation) {
      timers.delete(this.animation);
    }
    const getPos = () => {
      switch (state) {
        case 'dodge-left':
          return -1
        case 'dodge-right':
          return 1;
      }
      return 0;
    }
    const time = this.stance === 'idle' ? this.animationTime : this.animationTime * 2;

    const startPos = this.mesh.position.x;
    const timer: Timer = {
      date: performance.now(),
      tick: (elapsed) => {
        const percent = elapsed / time;
        this.mesh.position.setX(lerp(startPos, getPos(), percent));
      },
      end: () => {
        this.stance = state;
        this.animation = null;
      },
      time: time
    }
    timers.add(timer);
    this.animation = timer;
  }
}

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const material2 = new MeshBasicMaterial({ color: 0xaaaaaa });
const planeGeo = new PlaneGeometry();
const plane = new Mesh(planeGeo, material2)

plane.rotateX(80)
plane.scale.addScalar(10)

scene.add(plane);

const axesHelper = new AxesHelper(5);
scene.add(axesHelper);

camera.position.z = 5;
camera.position.y = 3;


function animate() {
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

  renderer.render(scene, camera);
}
animate();

type PlayerStance = 'idle' | 'dodge-left' | 'dodge-right' | 'dodge-down';
type PlayerAttack = 'attack-left' | 'attack-right' | 'attack-up' | 'attack-down'
const player = new Player(scene, new Vector3(0, 0.5, 1))
const enemy = new Player(scene, new Vector3(0, 0.5, -1))

player.enemy = enemy;
enemy.enemy = player;


window.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case 'w':

      break;

    case 'a':
      player.changeStance('dodge-left');
      break;

    case 'd':
      player.changeStance('dodge-right');

      break;

    case 's':

      break;

  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key.toLowerCase()) {
    case 'w':

      break;

    case 'a':
      player.changeStance('idle');
      break;

    case 'd':
      player.changeStance('idle');

      break;

    case 's':

      break;

  }
});
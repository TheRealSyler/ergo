import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  WebGLRenderer
} from 'three';

import { CharacterController } from './characterController';

class Game {
  renderer = new WebGLRenderer({
    antialias: true,
  });
  camera = new PerspectiveCamera(90, (window.innerWidth) / window.innerHeight, 0.1, 1000);
  scene = new Scene();
  playerChar = new CharacterController(this.scene);;

  /**the last requestAnimationFrame delta(time) */
  private previousRAF = 0;

  constructor() {

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    this.camera.position.set(25, 10, 25);

    let light = new DirectionalLight(0xFFFFFF, 0.4);
    light.position.set(-100, 100, 100);
    light.target.position.set(0, 0, 0);

    this.scene.add(light);

    light = new AmbientLight(0xFFFFFF, 1) as any;
    this.scene.add(light);

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0, 10, 0);
    controls.update();

    const plane = new Mesh(
      new PlaneGeometry(100, 100, 10, 10),
      new MeshStandardMaterial({
        color: 0x808080,
      }));

    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    this.Update();
  }

  private Update() {
    requestAnimationFrame((t) => {
      this.Update();

      this.renderer.render(this.scene, this.camera);
      const timeElapsedS = (t - this.previousRAF) * 0.001;

      if (this.playerChar) {
        this.playerChar.Update(timeElapsedS);
      }

      this.previousRAF = t;
    });
  }

}
export function startGame() {
  window.addEventListener('DOMContentLoaded', () => {
    new Game();
  });
}

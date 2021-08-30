import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer
} from 'three';

import { AttackStance, CharacterController, CharStance } from './characterController';
import { degToRad } from 'three/src/math/MathUtils';
import { AiCharacterControllerInput } from './aiCharacterInput';
export class Game {
  renderer = new WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  });
  camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.15, 1000);
  scene = new Scene();
  playerChar: CharacterController;
  aiChar = new CharacterController(this.scene, this.camera, new AiCharacterControllerInput(), false)
  debugCamera = false;
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

    let light = new DirectionalLight(0xFFFFFF, 0.4);
    light.position.set(-10, 10, 10);
    light.target.position.set(0, 0, 0);

    this.scene.add(light);

    light = new AmbientLight(0xFFFFFF, 1) as any;
    this.scene.add(light);

    if (this.debugCamera) {
      this.camera.position.set(0, 2, 3);
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.target.set(0, 1, 0);
      controls.update();
      this.playerChar = new CharacterController(this.scene, this.camera);
    } else {
      this.playerChar = new CharacterController(this.scene, this.camera, undefined, true);
    }

    this.aiChar.base.translateZ(0.6)
    this.aiChar.base.rotateY(degToRad(180))
    this.playerChar.base.translateZ(-0.6)

    const plane = new Mesh(
      new PlaneGeometry(40, 40, 1, 1),
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


      if (this.playerChar && this.aiChar) {
        this.playerChar.Update(timeElapsedS);
        this.aiChar.Update(timeElapsedS);
        this.updateFightStuff();
      }

      if (!this.debugCamera) {
        const target = new Vector3(0, 1, 1);
        this.camera.lookAt(target)
      }

      this.previousRAF = t;
    });
  }


  private updateFightStuff() {

    const playerStance = this.playerChar.stance;
    const aiStance = this.aiChar.stance;
    if (playerStance.type === 'attack' && playerStance.attackProgress === 'active') {
      const result = this.attack(aiStance, playerStance);
      if (result) {
        console.log('PLAYER HIT AI');
        playerStance.attackProgress = 'hit';
      }
    } else if (aiStance.type === 'attack' && aiStance.attackProgress === 'active') {
      const result = this.attack(playerStance, aiStance);
      if (result) {
        console.log('ai HIT PLAYER');
        const a = document.createElement('div');
        a.style.position = 'absolute';
        a.textContent = 'hit';
        a.style.top = '300px';
        a.style.left = '500px';
        a.style.color = '#f00';
        a.style.fontSize = '5rem';
        document.body.appendChild(a);
        setTimeout(() => {
          a.remove();
        }, 400);
        aiStance.attackProgress = 'hit';
      }

    }
  }

  private attack(defender: CharStance, attacker: AttackStance): boolean {

    if (defender.type === 'idle') {
      return true;
    } else if (defender.type === 'dodge') {
      if (defender.dodgeProgress === 'started') {
        return true;
      }
      switch (attacker.attackDirection) {
        case 'attack_down':
        case 'attack_up':
          if (defender.dodgeDirection === 'dodge_left' || defender.dodgeDirection === 'dodge_right') {
            return false;
          }
          return true

        case 'attack_left':
          if (defender.dodgeDirection === 'dodge_left') {
            return false
          }
          return true
        case 'attack_right':
          if (defender.dodgeDirection === 'dodge_right') {
            return false
          }
          return true
      }

    } else {
      return false
      // TODO do blocking.
    }
  }
}

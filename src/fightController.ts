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
import { Game } from './game';
import { FightUI } from './ui/fightUI';

export class FightController {
  renderer = new WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  });
  camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.15, 1000);
  scene = new Scene();
  /**aka player1 */
  playerChar: CharacterController;
  /**aka player2 */
  aiChar: CharacterController;

  ui = new FightUI()

  /**the last requestAnimationFrame delta(time) */
  private previousRAF = 0;
  private RAFref = -1;
  private paused = false;

  resize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
  constructor(private game: Game) {

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.resize,);

    let light = new DirectionalLight(0xFFFFFF, 0.4);
    light.position.set(-10, 10, 10);
    light.target.position.set(0, 0, 0);

    this.scene.add(light);

    light = new AmbientLight(0xFFFFFF, 1) as any;
    this.scene.add(light);

    this.playerChar = new CharacterController(this.scene, this.camera, undefined, true);
    this.aiChar = new CharacterController(this.scene, this.camera, this.playerChar)

    this.setPlayerPositions();

    const plane = new Mesh(
      new PlaneGeometry(40, 40, 1, 1),
      new MeshStandardMaterial({
        color: 0x808080,
      }));

    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    this.initUi();

    this.Update()
    window.addEventListener('keydown', this.keyListener)
  }

  private initUi() {
    this.ui.update('health', 'player1', this.playerChar);
    this.ui.update('health', 'player2', this.aiChar);
    this.ui.update('stamina', 'player1', this.playerChar);
    this.ui.update('stamina', 'player2', this.aiChar);
  }

  exit() {
    // TODO ? remove all objects, materials, geo etc, not sure if necessary though.
    cancelAnimationFrame(this.RAFref);
    window.removeEventListener('keydown', this.keyListener)
    this.renderer.dispose();
    this.renderer.domElement.remove();
    window.removeEventListener('resize', this.resize);
    this.game.goToMainMenu();
  }

  private keyListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { // TODO add keybindings
      if (this.paused) {
        this.unpause();
        this.ui.HUD()
      } else {
        this.paused = true
        this.pauseUpdate()
        this.playerChar.pause()
        this.aiChar.pause()
        this.ui.pauseMenu(this.exit.bind(this), () => {
          this.unpause();
        })

      }
    }

  }

  private unpause() {
    this.previousRAF = performance.now();
    this.playerChar.unpause();
    this.aiChar.unpause();
    this.Update();
    this.paused = false;
  }

  private pauseUpdate(setTimeOut = false) {
    if (setTimeOut) {
      setTimeout(() => {
        cancelAnimationFrame(this.RAFref);
      }, 0);
    }

    cancelAnimationFrame(this.RAFref);
  }

  endScreen() {
    this.pauseUpdate(true); // TODO remove this and add victory/defeat states.

    this.ui.endScreen(this.exit.bind(this), () => {
      this.playerChar.dispose()
      this.playerChar = new CharacterController(this.scene, this.camera, undefined, true);
      this.aiChar.dispose()
      this.aiChar = new CharacterController(this.scene, this.camera, this.playerChar)

      this.setPlayerPositions();
      this.initUi();

      this.Update()
    })
  }

  private setPlayerPositions() {
    this.aiChar.base.translateZ(0.6);
    this.aiChar.base.rotateY(degToRad(180));
    this.playerChar.base.translateZ(-0.6);
  }

  private Update() {
    this.RAFref = requestAnimationFrame((t) => {
      const timeElapsedSeconds = (t - this.previousRAF) * 0.001;
      this.renderer.render(this.scene, this.camera);

      this.playerChar.Update(timeElapsedSeconds);
      this.aiChar.Update(timeElapsedSeconds);
      this.updateFightStuff();


      const target = new Vector3(0, 1, 1);
      this.camera.lookAt(target)

      this.previousRAF = t;
      this.Update();
    });
  }

  private updateFightStuff() {

    const playerStance = this.playerChar.stance;
    const aiStance = this.aiChar.stance;
    if (playerStance.type === 'attack' && playerStance.attackProgress === 'active') {
      const result = this.attack(aiStance, playerStance);
      if (result) {
        playerStance.attackProgress = 'hit';
        this.aiChar.stateMachine.SetState('hit')
        this.aiChar.hp -= this.playerChar.stats.damage;
        if (this.aiChar.hp <= 0) {
          this.endScreen()
        }
        this.ui.update('health', 'player2', this.aiChar)
      }
    } else if (aiStance.type === 'attack' && aiStance.attackProgress === 'active') {
      const result = this.attack(playerStance, aiStance);
      if (result) {
        aiStance.attackProgress = 'hit';
        this.playerChar.hp -= this.aiChar.stats.damage;
        this.ui.update('health', 'player1', this.playerChar)

        if (this.playerChar.hp <= 0) {
          this.endScreen()
        }

        this.playerChar.stateMachine.SetState('hit')
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
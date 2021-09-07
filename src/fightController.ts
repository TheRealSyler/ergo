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
import { Game, Player } from './game';
import { FightUI } from './ui/fightUI';
import { AttackAnimations } from './animation/types';


const oppositeAttackDir: Record<AttackAnimations, AttackAnimations> = {
  attack_down: 'attack_up',
  attack_left: 'attack_right',
  attack_right: 'attack_left',
  attack_up: 'attack_down'
}
type AttackResult = 'hit' | 'not_hit' | 'blocked';

export class FightController {
  renderer = new WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  });
  camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.15, 1000);
  scene = new Scene();

  players: Record<Player, CharacterController>;

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
    const playerChar = new CharacterController('player1', this.scene, this.camera, undefined, true);
    const aiChar = new CharacterController('player2', this.scene, this.camera, playerChar)

    this.players = {
      player1: playerChar,
      player2: aiChar
    }

    this.setPlayerPositions();

    const plane = new Mesh(
      new PlaneGeometry(40, 40, 1, 1),
      new MeshStandardMaterial({
        color: 0x808080,
      }));

    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    this.initUi();

    this.Update(0)
    window.addEventListener('keydown', this.keyListener)
  }

  private initUi() {
    this.ui.update('health', this.players.player1);
    this.ui.update('health', this.players.player2);
    this.ui.update('stamina', this.players.player1);
    this.ui.update('stamina', this.players.player2);
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
        this.players.player1.pause()
        this.players.player2.pause()
        this.ui.pauseMenu(this.exit.bind(this), () => {
          this.unpause();
        })
      }
    }
  }

  private unpause() {
    this.previousRAF = performance.now();
    this.players.player1.unpause()
    this.players.player2.unpause()
    this.Update(performance.now());
    this.paused = false;
  }

  private pauseUpdate() {
    // do it twice just to be sure ???.
    // setTimeout(() => {
    //   cancelAnimationFrame(this.RAFref);
    // }, 0);

    cancelAnimationFrame(this.RAFref);
  }

  endScreen() {

    this.ui.endScreen(this.exit.bind(this), () => {
      this.players.player1.dispose()
      this.players.player1 = new CharacterController('player1', this.scene, this.camera, undefined, true);
      this.players.player2.dispose()
      this.players.player2 = new CharacterController('player2', this.scene, this.camera, this.players.player1)

      this.setPlayerPositions();
      this.initUi();

    })
  }

  private setPlayerPositions() {
    this.players.player2.base.translateZ(0.6);
    this.players.player2.base.rotateY(degToRad(180));
    this.players.player1.base.translateZ(-0.6);
  }

  private Update(delta: number) {
    const timeElapsedSeconds = (delta - this.previousRAF) * 0.001;
    this.renderer.render(this.scene, this.camera);

    this.players.player1.Update(timeElapsedSeconds);
    this.players.player2.Update(timeElapsedSeconds);
    this.updateFightStuff();

    const target = new Vector3(0, 1, 1);
    this.camera.lookAt(target)

    this.previousRAF = delta;
    this.RAFref = requestAnimationFrame(this.Update.bind(this));
  }

  private updateFightStuff() {

    const playerStance = this.players.player1.stance;
    const aiStance = this.players.player2.stance;
    if (playerStance.type === 'attack' && playerStance.attackProgress === 'active') {
      const result = this.attack(aiStance, playerStance);
      this.checkAttack(result, 'player1', 'player2')

    } else if (aiStance.type === 'attack' && aiStance.attackProgress === 'active') {
      const result = this.attack(playerStance, aiStance);
      this.checkAttack(result, 'player2', 'player1')

    }
  }

  private checkAttack(result: AttackResult, attacker: Player, defender: Player) {
    switch (result) {
      case 'hit':
        (this.players[attacker].stance as AttackStance).attackProgress = 'hit';
        this.players[defender].hp -= this.players[attacker].stats.damage;
        this.ui.update('health', this.players[defender])

        if (this.players[defender].hp <= 0) {
          this.endScreen()
          this.players[defender].stateMachine.SetState('death')
          this.players[attacker].stateMachine.SetState('victory')
        } else {
          this.players[defender].stateMachine.SetState('hit')
        }
        break;
      case 'blocked':
        (this.players[attacker].stance as AttackStance).attackProgress = 'hit';
        this.players[defender].stateMachine.SetState('hit')
        this.players[attacker].stateMachine.SetState('hit')
    }
  }

  private attack(defender: CharStance, attacker: AttackStance): AttackResult {

    if (defender.type === 'idle') {
      return 'hit';
    } else if (defender.type === 'dodge') {
      if (defender.dodgeProgress === 'started') {
        return 'hit';
      }
      switch (attacker.attackDirection) {
        case 'attack_down':
        case 'attack_up':
          if (defender.dodgeDirection === 'dodge_left' || defender.dodgeDirection === 'dodge_right') {
            return 'not_hit';
          }
          return 'hit';

        case 'attack_left':
          if (defender.dodgeDirection === 'dodge_left') {
            return 'not_hit';
          }
          return 'hit';
        case 'attack_right':
          if (defender.dodgeDirection === 'dodge_right') {
            return 'not_hit';
          }
          return 'hit';
      }

    } else if (defender.type === 'attack') {
      if (defender.attackProgress === 'finished') {
        return 'hit'
      }

      if (oppositeAttackDir[attacker.attackDirection] === defender.attackDirection) {
        return 'blocked';
      }

      return 'hit'

    }
    return 'not_hit';
  }

}

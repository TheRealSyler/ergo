import {
  SkeletonHelper,
  Vector3,
} from 'three';

import { AttackStance, CharacterController, CharStance } from '../character/characterController';
import { degToRad } from 'three/src/math/MathUtils';
// import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper';
import { Game, Player } from '../game';
import { FightUI } from '../ui/fightUI';
import { AttackAnimations } from '../animation/types';
import { AiInput } from '../ai/aiCharacterInput';
import { PlayerInput } from '../playerInput';
import { randomInRange } from '../utils';
import { Room } from '../rooms/rooms';
import { Renderer } from '../renderer';

const oppositeAttackDir: Record<AttackAnimations, AttackAnimations> = {
  attack_down: 'attack_up',
  attack_left: 'attack_right',
  attack_right: 'attack_left',
  attack_up: 'attack_down'
}
type AttackResult = 'hit' | 'not_hit' | 'blocked';

export class FightController extends Renderer {
  private paused = false;
  private lookAtPoint = new Vector3(0, 1, 0)

  constructor(private game: Game, private players: Record<Player, CharacterController>, public ui: FightUI, private humanPlayer: Player, room: Room) {
    super()
    this.scene.add(room.scene)
    if (room.background) {
      // this.scene.background = stage.background
      this.scene.environment = room.background
      // TODO research this RoughnessMipmapper thing.
      // the code is from https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_gltf.html
      // const roughnessMipmapper = new RoughnessMipmapper(this.renderer);

      // this.scene.traverse(function (child) {
      //   // @ts-ignore
      //   if (child.isMesh) {

      //     // @ts-ignore
      //     roughnessMipmapper.generateMipmaps(child.material);

      //   }

      // });

      // roughnessMipmapper.dispose();
    }

    this.scene.add(players.player1.model);
    this.scene.add(players.player2.model);

    this.setPlayerPositions();

    const skeleton = new SkeletonHelper(this.players[this.humanPlayer].model);
    skeleton.visible = false;
    const head = skeleton.bones.find((bone) => bone.name === 'head');
    if (head) {
      head.add(this.camera);
      if (humanPlayer === 'player1') {
        this.camera.rotateY(degToRad(180));
      }

    }

    this.initUi();

    setTimeout(() => {
      // TODO add ui countdown.
      this.startFight()
    }, 2000);

    if (humanPlayer === 'player1') {
      // this.lookAtPoint = new Vector3(0, 1, 1)
      this.lookAtPoint.z = 1
    } else {
      this.lookAtPoint.z = -1
    }

    this.updateRenderer(0)
    window.addEventListener('keydown', this.keyListener)
  }

  private initUi() {
    this.ui.update('health', this.players.player1);
    this.ui.update('health', this.players.player2);
    this.ui.update('stamina', this.players.player1);
    this.ui.update('stamina', this.players.player2);
  }

  private startFight() {
    if (this.humanPlayer === 'player1') {
      this.players.player1.input = new PlayerInput();
      this.players.player2.input = new AiInput(this.players.player2, this.players.player2);
    } else {
      this.players.player2.input = new PlayerInput();
      this.players.player1.input = new AiInput(this.players.player1, this.players.player2);
    }

  }

  exit() {
    // TODO ? remove all objects, materials, geo etc, not sure if necessary though.
    this.disposeRenderer()
    this.players.player1.dispose()
    this.players.player2.dispose()
    window.removeEventListener('keydown', this.keyListener)

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
    this.updateRenderer(performance.now());
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
      // TODO RESET characters.
      // this.players.player1.dispose()
      // this.players.player1 = new CharacterController('player1',this.ui);
      // this.players.player2.dispose()
      // this.players.player2 = new CharacterController('player2', this.scene, this.camera, this.ui, this.players.player1)

      this.setPlayerPositions();
      this.initUi();

    })
  }

  private setPlayerPositions() {
    this.players.player2.model.translateZ(0.6);
    this.players.player2.model.rotateY(degToRad(180));
    this.players.player1.model.translateZ(-0.6);

  }

  protected update(delta: number) {
    const timeElapsedSeconds = (delta - this.previousRAF) * 0.001;
    this.players.player1.update(timeElapsedSeconds);
    this.players.player2.update(timeElapsedSeconds);
    this.updateFightStuff();

    this.camera.lookAt(this.lookAtPoint)
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
        this.players[defender].hp -= randomInRange(this.players[attacker].stats.damage);
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

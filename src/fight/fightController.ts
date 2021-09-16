import {
  SkeletonHelper,
  Vector3,
} from 'three';

import { AttackStance, CharacterController, CharStance } from '../character/characterController';
import { degToRad } from 'three/src/math/MathUtils';
// import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper';
import { Player } from '../game';
import { FightUI } from '../ui/fightUI';
import { AttackAnimations } from '../animation/types';
import { AiInput } from '../ai/aiCharacterInput';
import { PlayerInput } from '../playerInput';
import { randomInRange } from '../utils';
import { Renderer } from '../renderer';

const oppositeAttackDir: Record<AttackAnimations, AttackAnimations> = {
  attack_down: 'attack_up',
  attack_left: 'attack_right',
  attack_right: 'attack_left',
  attack_up: 'attack_down'
}
type AttackResult = 'hit' | 'not_hit' | 'blocked';


export interface FightControllerOptions {
  customEndScreen?: (victory: boolean, dispose: () => void, restart: () => void) => void
  /**add exit option to pause menu and end screen(if the customEndScreen is not provided) */
  exit?: () => void;
  uiExitText?: string
}

export class FightController {
  private paused = false;
  private isInEndScreen = false;
  private lookAtPoint = new Vector3(0, 1, 0)

  constructor(private players: Record<Player, CharacterController>, public ui: FightUI, private humanPlayer: Player, private renderer: Renderer, private options: FightControllerOptions) {

    this.setPlayerPositions();

    this.attachCamera(humanPlayer);

    this.resetUi();

    this.startFight()

    if (humanPlayer === 'player1') {
      // this.lookAtPoint = new Vector3(0, 1, 1)
      this.lookAtPoint.z = -1
    } else {
      this.lookAtPoint.z = 1
    }

    window.addEventListener('keydown', this.keyListener)
  }

  private attachCamera(humanPlayer: string) {
    this.renderer.camera.position.set(0, 0, 0);
    this.renderer.camera.rotation.set(0, 0, 0);
    this.renderer.camera.near = 0.15
    this.renderer.camera.updateProjectionMatrix()

    const skeleton = new SkeletonHelper(this.players[this.humanPlayer].model);
    skeleton.visible = false;
    const head = skeleton.bones.find((bone) => bone.name === 'head');
    if (head) {
      head.add(this.renderer.camera);
      // if (humanPlayer === 'player1') { 
      //   this.renderer.camera.rotateY(degToRad(180));
      // }
    }
  }

  private resetUi() {
    this.ui.update('health', this.players.player1);
    this.ui.update('health', this.players.player2);
    this.ui.update('stamina', this.players.player1);
    this.ui.update('stamina', this.players.player2);
  }

  private startFight() {
    setTimeout(() => {
      // TODO add ui countdown.
      if (this.humanPlayer === 'player1') {
        this.players.player1.input = new PlayerInput();
        this.players.player2.input = new AiInput(this.players.player2, this.players.player2);
      } else {
        this.players.player2.input = new PlayerInput();
        this.players.player1.input = new AiInput(this.players.player1, this.players.player2);
      }
    }, 2000);
  }

  dispose() {
    // TODO ? remove all objects, materials, geo etc, not sure if necessary though.

    this.players.player1.dispose()
    this.players.player2.dispose()
    window.removeEventListener('keydown', this.keyListener)

  }

  private exit() {
    this.dispose()
    this.options.exit && this.options.exit()
  }

  private keyListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !this.isInEndScreen) { // TODO add keybindings
      if (this.paused) {
        this.unpause();
        this.ui.HUD()
      } else {
        this.paused = true
        this.players.player1.pause()
        this.players.player2.pause()
        this.renderer.pause()
        this.ui.pauseMenu(() => {
          this.unpause()
        }, this.options.exit ? this.exit.bind(this) : undefined)
      }
    }
  }

  private unpause() {
    this.renderer.unpause()
    this.players.player1.unpause()
    this.players.player2.unpause()

    this.paused = false;
  }

  endScreen(victory: boolean) {
    this.isInEndScreen = true
    if (this.options.customEndScreen) {
      this.options.customEndScreen(victory, this.dispose.bind(this), this.restartFight.bind(this))
    } else {
      this.ui.endScreen(this.restartFight.bind(this), this.options.exit ? this.exit.bind(this) : undefined)
    }
  }

  restartFight() {
    this.players.player1.restart()
    this.players.player2.restart()
    this.resetUi();
    this.startFight()
  }

  private setPlayerPositions() {
    this.players.player1.model.translateZ(0.6);
    this.players.player1.model.rotateY(degToRad(180));
    this.players.player2.model.translateZ(-0.6);

  }

  update(timeElapsedInSeconds: number) {
    this.players.player1.update(timeElapsedInSeconds);
    this.players.player2.update(timeElapsedInSeconds);
    this.updateFightStuff();

    this.renderer.camera.lookAt(this.lookAtPoint)
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
          this.endScreen(attacker === this.humanPlayer)
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

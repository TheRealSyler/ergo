import {
  SkeletonHelper,
  Vector3,
} from 'three';

import { AttackStance, CharacterController, CharStance } from '../character/characterController';
import { degToRad } from 'three/src/math/MathUtils';
// import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper';
import { Player } from '../game';
import { FightUI, victoryOrLossUI } from '../ui/fightUI';
import { AiInput } from '../ai/aiCharacterInput';
import { PlayerInput } from '../playerInput';
import { randomInRange } from '../utils';
import { Renderer } from '../renderer';
import { checkAiDifficulty } from '../character/stats';
import { AttackAnimations, BlockAnimations } from '../animation/types';
import { OptionsUI } from '../ui/optionsUI';
import { PauseMenuUI } from '../ui/pauseMenu';
import { getKeybinding } from '../keybindings';

type AttackResult = 'hit' | 'not_hit' | 'blocked';

export const BLOCK_DIRECTIONS: Record<AttackAnimations, BlockAnimations> = {
  attack_down: 'block_up',
  attack_left: 'block_left',
  attack_right: 'block_right',
  attack_up: 'block_down'
}

export interface FightControllerOptions {
  customEndScreen?: (victory: boolean, dispose: () => void, endScreen: () => void) => void
  showInventoryInMenu?: () => void,
  exitToMainMenu: () => void;
  run?: () => void
}

export class FightController {
  private paused = false;
  private isInEndScreen = false;
  private lookAtPoint = new Vector3(0, 1, 0)
  private pauseUI = new PauseMenuUI()
  constructor(private players: Record<Player, CharacterController>, public ui: FightUI, private humanPlayer: Player, private renderer: Renderer, private options: FightControllerOptions) {

    this.setPlayerPositions();

    this.attachCamera();

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

  private attachCamera() {
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
    this.ui.showDifficulty(this.difficulty())
    this.ui.update('health', this.players.player1);
    this.ui.update('health', this.players.player2);
    this.ui.update('stamina', this.players.player1);
    this.ui.update('stamina', this.players.player2);
  }

  private startFight() {
    this.isInEndScreen = true
    this.ui.startFight(() => {
      this.isInEndScreen = false
      if (this.humanPlayer === 'player1') {
        this.players.player1.input = new PlayerInput();
        this.players.player2.input = new AiInput(this.players.player2, this.players.player1);
      } else {
        this.players.player2.input = new PlayerInput();
        this.players.player1.input = new AiInput(this.players.player1, this.players.player2);
      }
    })
  }

  dispose() {
    // TODO ? remove all objects, materials, geo etc, not sure if necessary though.

    this.players.player1.dispose()
    this.players.player2.dispose()
    window.removeEventListener('keydown', this.keyListener)

  }

  private exit() {
    this.dispose()
  }

  private keyListener = (e: KeyboardEvent) => {
    if (e.key.toUpperCase() === getKeybinding('Fight', 'PauseMenu') && !this.isInEndScreen) { // TODO add keybindings
      if (this.paused) {
        this.unpause();
        this.ui.HUD()
      } else {
        this.paused = true
        this.players.player1.pause()
        this.players.player2.pause()
        this.renderer.pause()
        this.pauseUI.show({
          mainMenu: () => {
            this.exit.bind(this)
            this.options.exitToMainMenu()
          },
          options: OptionsUI,
          run: this.options.run,
          restart: this.restartFight.bind(this),
          resume: () => {
            this.unpause()
            this.ui.HUD()
          }
        })
      }
    }
  }

  private unpause() {
    this.ui.showDifficulty(this.difficulty())
    this.renderer.unpause()
    this.players.player1.unpause()
    this.players.player2.unpause()

    this.paused = false;
  }

  endScreen(victory: boolean) {
    this.isInEndScreen = true
    this.players.player1.pause()
    this.players.player2.pause()
    const endScreenMenu = () => this.pauseUI.show({
      mainMenu: () => {
        this.exit.bind(this)
        this.options.exitToMainMenu()
      },
      options: OptionsUI,
      inventory: this.options.showInventoryInMenu,
      run: this.options.run,
      restart: this.restartFight.bind(this)
    });

    if (this.options.customEndScreen) {
      this.options.customEndScreen(victory, this.dispose.bind(this), () => {
        endScreenMenu()
        victoryOrLossUI(victory)
      })
    } else {
      endScreenMenu();
      victoryOrLossUI(victory)
    }
  }

  private difficulty() {
    if (this.humanPlayer === 'player1') {
      return checkAiDifficulty(this.players.player1.stats, this.players.player2.stats)
    } else {
      return checkAiDifficulty(this.players.player2.stats, this.players.player1.stats)

    }
  }

  restartFight() {
    this.isInEndScreen = false
    if (this.paused) {
      this.unpause()
    }
    this.players.player1.unpause()
    this.players.player2.unpause()
    this.players.player1.restart()
    this.players.player2.restart()
    this.resetUi();
    this.ui.HUD()
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
        this.players[attacker].stats.stamina = Math.max(0, this.players[attacker].stats.stamina - (this.players[attacker].stats.maxStamina * 0.4))
        this.players[attacker].stateMachine.SetState('hit')
        this.players[defender].stateMachine.SetState('idle')
        break;
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
      return 'hit'
    } else if (defender.type === 'block') {
      if (defender.blockProgress === 'active' && BLOCK_DIRECTIONS[attacker.attackDirection] === defender.blockDirection) {
        return 'blocked';
      }
      return 'hit'
    }
    return 'not_hit';
  }

}

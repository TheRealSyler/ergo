import { CharacterController } from '../characterController';
import { Input } from '../playerInput';
import { FiniteStateMachine } from '../finiteStateMachine';
import { AttackAnimations, DodgeAnimations } from '../animation/types';
import { AiAttackingState } from './aiAttackingState';
import { AiDodgingState } from './aiDodgingState';
import { AiIdleState } from './aiIdleState';

export type AiStates = 'idle' | 'dodging' | 'attacking';

export const DodgePossibilities: { [key in AttackAnimations]: DodgeAnimations | DodgeAnimations[] } = {
  attack_down: ['dodge_left', 'dodge_right'],
  attack_right: 'dodge_right',
  attack_left: 'dodge_left',
  attack_up: ['dodge_right', 'dodge_left']
}

export class AiCharacterControllerInput implements Input {
  keys = {
    attack_right: false,
    attack_left: false,
    attack_up: false,
    attack_down: false,
    dodge_left: false,
    dodge_right: false
  };

  private aiStateMachine: FiniteStateMachine<AiStates> = new FiniteStateMachine<AiStates>({
    attacking: new AiAttackingState(this.selfRef, this.keys),
    dodging: new AiDodgingState(this.playerChar, this.keys),
    idle: new AiIdleState(this.playerChar)
  })

  constructor(private selfRef: CharacterController, private playerChar: CharacterController) {
    this.aiStateMachine.SetState('idle')
  }

  pause() { }
  unpause() { }
  dispose() { }

  update(elapsedTimeInSeconds: number) {
    this.aiStateMachine.Update(elapsedTimeInSeconds)
  }
};
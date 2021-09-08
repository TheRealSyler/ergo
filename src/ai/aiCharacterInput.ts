import { CharacterController } from '../character/characterController';
import { Input } from '../playerInput';
import { FiniteStateMachine } from '../finiteStateMachine';
import { AttackAnimations, DodgeAnimations } from '../animation/types';
import { AiAttackingState } from './aiAttackingState';
import { AiDodgingState } from './aiDodgingState';
import { AiIdleState } from './aiIdleState';

export type AiStates = 'ai_idle' | 'ai_dodging' | 'ai_attacking';

export const DodgePossibilities: { [key in AttackAnimations]: DodgeAnimations | DodgeAnimations[] } = {
  attack_down: ['dodge_left', 'dodge_right'],
  attack_right: 'dodge_right',
  attack_left: 'dodge_left',
  attack_up: ['dodge_right', 'dodge_left']
}

export class AiInput implements Input {
  keys = {
    attack_right: false,
    attack_left: false,
    attack_up: false,
    attack_down: false,
    dodge_left: false,
    dodge_right: false
  };

  private aiStateMachine: FiniteStateMachine<AiStates> = new FiniteStateMachine<AiStates>({
    ai_attacking: new AiAttackingState(this.selfRef, this.keys),
    ai_dodging: new AiDodgingState(this.playerChar, this.keys),
    ai_idle: new AiIdleState(this.playerChar)
  })

  constructor(private selfRef: CharacterController, private playerChar: CharacterController) {
    this.aiStateMachine.SetState('ai_idle')
  }

  pause() { }
  unpause() { }
  dispose() { }

  update(elapsedTimeInSeconds: number) {
    this.aiStateMachine.Update(elapsedTimeInSeconds)
  }
};
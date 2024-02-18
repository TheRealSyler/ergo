import type { AttackAnimations, DodgeAnimations } from '../animation/types';
import { CharacterController } from '../character/characterController';
import { FiniteStateMachine } from '../finiteStateMachine';
import { EMPTY_INPUT, type Input } from '../playerInput';
import { AiAttackingState } from './aiAttackingState';
import { AiBlockState } from './aiBlockState';
import { AiDodgingState } from './aiDodgingState';
import { AiIdleState } from './aiIdleState';

export type AiStates = 'ai_idle' | 'ai_dodging' | 'ai_attacking' | 'ai_block';

export const DODGE_POSSIBILITIES: { [key in AttackAnimations]: DodgeAnimations | DodgeAnimations[] } = {
  attack_down: ['dodge_left', 'dodge_right'],
  attack_right: 'dodge_right',
  attack_left: 'dodge_left',
  attack_up: ['dodge_right', 'dodge_left']
}

export class AiInput implements Input {
  keys = { ...EMPTY_INPUT.keys };

  private aiStateMachine: FiniteStateMachine<AiStates> = new FiniteStateMachine<AiStates>({
    ai_attacking: new AiAttackingState(this.aiChar, this.keys),
    ai_dodging: new AiDodgingState(this.aiChar, this.playerChar, this.keys),
    ai_idle: new AiIdleState(this.aiChar, this.playerChar),
    ai_block: new AiBlockState(this.aiChar, this.playerChar, this.keys)
  })

  constructor(private aiChar: CharacterController, private playerChar: CharacterController) {
    this.aiStateMachine.SetState('ai_idle')
  }

  pause() { }
  unpause() { }
  dispose() { }

  update(elapsedTimeInSeconds: number) {
    this.aiStateMachine.Update(elapsedTimeInSeconds)
  }
};
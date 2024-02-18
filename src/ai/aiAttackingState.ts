import type { AttackAnimations } from '../animation/types';
import { CharacterController } from '../character/characterController';
import { FiniteStateMachine, State } from '../finiteStateMachine';
import type { Input } from '../playerInput';
import { chooseRandomArrayEl } from '../utils';
import type { AiStates } from './aiCharacterInput';

export class AiAttackingState extends State<AiStates> {
  constructor(private aiChar: CharacterController, private keysRef: Input['keys']) {
    super('ai_attacking');
  }
  private direction?: AttackAnimations;
  Enter() {
    this.direction = chooseRandomArrayEl(['attack_down', 'attack_left', 'attack_right', 'attack_up'] as AttackAnimations[]);
    this.keysRef[this.direction] = true;
  }
  Update(fsm: FiniteStateMachine<AiStates>) {
    if (this.aiChar.stateMachine.currentState?.name === 'idle') {
      fsm.SetState('ai_idle');
    }
  }
  Exit() {
    if (this.direction) {
      this.keysRef[this.direction] = false;
      this.direction = undefined;
    }
  }
}

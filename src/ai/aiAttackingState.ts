import { CharacterController } from '../character/characterController';
import { Input } from '../playerInput';
import { FiniteStateMachine, State } from '../finiteStateMachine';
import { AttackAnimations } from '../animation/types';
import { chooseRandomArrayEl } from '../utils';
import { AiStates } from './aiCharacterInput';

export class AiAttackingState extends State<AiStates> {
  constructor(private selfRef: CharacterController, private keysRef: Input['keys']) {
    super('ai_attacking');
  }
  private direction?: AttackAnimations;
  Enter() {
    this.direction = chooseRandomArrayEl(['attack_down', 'attack_left', 'attack_right', 'attack_up'] as AttackAnimations[]);
    this.keysRef[this.direction] = true;
  }
  Update(fsm: FiniteStateMachine<AiStates>) {
    if (this.selfRef.stateMachine.currentState?.name === 'idle') {
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

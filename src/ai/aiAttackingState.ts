import { CharacterController } from '../characterController';
import { Input } from '../characterControllerInput';
import { FiniteStateMachine, State } from '../states/finiteStateMachine';
import { AttackAnimations } from '../states/types';
import { chooseRandomArrayEl } from '../utils';
import { AiStates } from './aiCharacterInput';

export class AiAttackingState extends State<AiStates> {
  constructor(private selfRef: CharacterController, private keysRef: Input['keys']) {
    super('attacking');
  }
  private direction?: AttackAnimations;
  Enter() {

    this.direction = chooseRandomArrayEl(['attack_down', 'attack_left', 'attack_right', 'attack_up'] as AttackAnimations[]);
    this.keysRef[this.direction] = true;
  }
  Update(fsm: FiniteStateMachine<AiStates>) {
    if (this.direction) {
      this.keysRef[this.direction] = false;
      this.direction = undefined;
    }
    if (this.selfRef.stateMachine.currentState?.name === 'idle') {
      fsm.SetState('idle');
    }
  }
}

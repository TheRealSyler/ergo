import type { BlockAnimations } from '../animation/types';
import { CharacterController } from '../character/characterController';
import { FiniteStateMachine, State } from '../finiteStateMachine';
import type { Input } from '../playerInput';
import { checkChance } from '../utils';
import type { AiStates } from './aiCharacterInput';

export class AiBlockState extends State<AiStates> {
  constructor(private aiChar: CharacterController, private playerChar: CharacterController, private keysRef: Input['keys']) {
    super('ai_attacking');
  }
  private direction?: BlockAnimations;
  private blockSuccess = false
  private needsToClean = false
  Enter() {
    this.blockSuccess = checkChance(this.aiChar.stats.aiBlockChance);
    if (this.aiChar.input.aiBlockDirection && this.blockSuccess) {
      this.direction = this.aiChar.input.aiBlockDirection;
      this.keysRef[this.direction] = true;
      this.aiChar.input.aiSuccessfullyBlocked = true
    }
    this.needsToClean = true
  }
  Update(fsm: FiniteStateMachine<AiStates>) {
    if (this.needsToClean) {
      this.needsToClean = false
      if (this.direction) {
        this.keysRef[this.direction] = false;
        this.direction = undefined;
      }
      this.aiChar.input.aiBlockDirection = undefined
    }
    if (this.blockSuccess) {
      if (this.aiChar.stateMachine.currentState?.name === 'idle') fsm.SetState('ai_idle');
    } else {
      if (this.playerChar.stance.type !== 'attack') fsm.SetState('ai_idle');
    }
  }

}

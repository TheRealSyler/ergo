import { CharacterController } from '../characterController';
import { Input } from '../characterControllerInput';
import { FiniteStateMachine, State } from '../states/finiteStateMachine';
import { DodgeAnimations } from '../states/types';
import { chooseRandomArrayEl, error } from '../utils';
import { AiStates, DodgePossibilities } from './aiCharacterInput';

export class AiDodgingState extends State<AiStates> {
  constructor(private playerChar: CharacterController, private keysRef: Input['keys']) {
    super('dodging');
  }
  private direction: DodgeAnimations = 'dodge_left';
  private timeToDodge = -1;
  Enter() {
    if (this.playerChar.stance.type === 'attack') {
      const dodge = DodgePossibilities[this.playerChar.stance.attackDirection];
      this.direction = Array.isArray(dodge) ? chooseRandomArrayEl(dodge) : dodge;
      this.timeToDodge = 0.1 + (Math.random() * 0.2);
    } else {
      error('THIS SHOULD NOT HAPPEN', 'AiDodgingState');
    }
  }

  Update(fsm: FiniteStateMachine<AiStates>, timeElapsedInSeconds: number) {
    if (this.timeToDodge > 0) {

      this.timeToDodge -= timeElapsedInSeconds;

      if (this.timeToDodge < 0) {
        this.keysRef[this.direction] = true;
      }
    } else if (this.playerChar.stance.type !== 'attack') {
      this.keysRef[this.direction] = false;
      fsm.SetState('idle');
    }
  }
}

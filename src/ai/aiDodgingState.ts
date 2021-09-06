import { CharacterController } from '../characterController';
import { Input } from '../playerInput';
import { FiniteStateMachine, State } from '../states/finiteStateMachine';
import { DodgeAnimations } from '../states/types';
import { chooseRandomArrayEl, error, randomInRange } from '../utils';
import { AiStates, DodgePossibilities } from './aiCharacterInput';

export class AiDodgingState extends State<AiStates> {
  constructor(private playerChar: CharacterController, private keysRef: Input['keys']) {
    super('dodging');
  }
  private direction: DodgeAnimations = 'dodge_left';
  private dodgeReactionTimeCounter = -1;
  Enter() {
    if (this.playerChar.stance.type === 'attack') {
      const dodge = DodgePossibilities[this.playerChar.stance.attackDirection];
      this.direction = Array.isArray(dodge) ? chooseRandomArrayEl(dodge) : dodge;
      this.dodgeReactionTimeCounter = randomInRange(this.playerChar.stats.aiDodgeReactionTime);
    } else {
      error('THIS SHOULD NOT HAPPEN', AiDodgingState.name);
    }
  }

  Update(fsm: FiniteStateMachine<AiStates>, timeElapsedInSeconds: number) {
    if (this.dodgeReactionTimeCounter > 0) {

      this.dodgeReactionTimeCounter -= timeElapsedInSeconds;

      if (this.dodgeReactionTimeCounter < 0) {
        this.keysRef[this.direction] = true;
      }
    } else if (this.playerChar.stance.type !== 'attack') {
      this.keysRef[this.direction] = false;
      fsm.SetState('idle');
    }
  }
}

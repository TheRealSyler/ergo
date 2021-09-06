import { CharacterController } from '../characterController';
import { FiniteStateMachine, State } from '../finiteStateMachine';
import { randomInRange } from '../utils';
import { AiStates } from './aiCharacterInput';

export class AiIdleState extends State<AiStates> {
  private timeToAttack = -1;

  constructor(private playerChar: CharacterController) {
    super('idle');
  }
  Enter() {
    this.timeToAttack = randomInRange(this.playerChar.stats.aiTimeToAttack);
  }
  Update(fsm: FiniteStateMachine<AiStates>, timeElapsed: number) {
    switch (this.playerChar.stance.type) {
      case 'idle':
        if (this.timeToAttack > 0) {

          this.timeToAttack -= timeElapsed;

          if (this.timeToAttack < 0) {
            fsm.SetState('attacking');
          }
        }
        return;
      case 'attack':
        fsm.SetState('dodging');
        return;
    }
  }
}

import { CharacterController } from '../character/characterController';
import { FiniteStateMachine, State } from '../finiteStateMachine';
import { randomInRange } from '../utils';
import { AiStates } from './aiCharacterInput';

export class AiIdleState extends State<AiStates> {
  private timeToAttack = -1;

  constructor(private playerChar: CharacterController) {
    super('ai_idle');
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
            fsm.SetState('ai_attacking');
          }
        }
        return;
      case 'attack':
        fsm.SetState('ai_dodging');
        return;
    }
  }
}

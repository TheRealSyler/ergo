import { CharacterController } from '../characterController';
import { FiniteStateMachine, State } from '../states/finiteStateMachine';
import { AiStates } from './aiCharacterInput';

export class AiIdleState extends State<AiStates> {
  private timeToAttack = -1;

  constructor(private playerChar: CharacterController) {
    super('idle');
  }
  Enter() {
    this.timeToAttack = 1 + (Math.random() * 1.5);
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

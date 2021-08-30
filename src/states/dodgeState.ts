
import { Input } from '../characterControllerInput';
import { State, FiniteStateMachine } from './finiteStateMachine';
import { getAnimAction } from "../utils";
import { AnimationTypes, DodgeAnimations } from './types';
import { CharacterController } from '../characterController';

export class DodgeState extends State<AnimationTypes> {
  startTime = 0;
  timeToDodge = 80;
  hasDodged = false;

  constructor(private direction: DodgeAnimations, private key: keyof Input['keys'], private charRef: CharacterController) {
    super(direction);
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    this.hasDodged = false
    this.startTime = performance.now()
    const curAction = getAnimAction(this.charRef.animations, this.direction);
    this.charRef.stance = { type: 'dodge', dodgeDirection: this.direction, dodgeProgress: 'started' }
    if (prevState) {
      const prevAction = getAnimAction(this.charRef.animations, prevState.Name);

      curAction.enabled = true;

      curAction.time = 0.0;
      // curAction.setEffectiveTimeScale(1.0);
      // curAction.setEffectiveWeight(1.0);

      curAction.crossFadeFrom(prevAction, 0.1, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(fsm: FiniteStateMachine<AnimationTypes>, timeElapsed: number) {
    if (this.charRef.input.keys[this.key]) {
      if (!this.hasDodged && performance.now() - this.startTime > this.timeToDodge) {
        this.hasDodged = true
        this.charRef.stance = { type: 'dodge', dodgeDirection: this.direction, dodgeProgress: 'evaded' }
      }
      return;
    }
    fsm.SetState('idle');
  }
}
;

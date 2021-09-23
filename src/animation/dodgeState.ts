
import { Input } from '../playerInput';
import { State, FiniteStateMachine } from '../finiteStateMachine';
import { getAnimAction } from "../utils";
import { AnimationTypes, DodgeAnimations } from './types';
import { CharacterController } from '../character/characterController';

export class DodgeState extends State<AnimationTypes> {

  dodgeSpeedCounter = 0.1;

  constructor(private direction: DodgeAnimations, private key: keyof Input['keys'], private charRef: CharacterController) {
    super(direction);
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    this.dodgeSpeedCounter = this.charRef.stats.dodgeSpeed
    const curAction = getAnimAction(this.charRef.animations, this.direction);
    this.charRef.stance = { type: 'dodge', dodgeDirection: this.direction, dodgeProgress: 'started' }
    if (prevState) {
      const prevAction = getAnimAction(this.charRef.animations, prevState.name);

      curAction.enabled = true;
      curAction.time = 0.0;

      curAction.crossFadeFrom(prevAction, this.charRef.stats.dodgeSpeed, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Update(fsm: FiniteStateMachine<AnimationTypes>, timeElapsedInSeconds: number) {
    if (this.charRef.input.keys[this.key]) {
      if (this.dodgeSpeedCounter > 0) {

        this.dodgeSpeedCounter -= timeElapsedInSeconds;

        if (this.dodgeSpeedCounter <= 0) {
          this.charRef.stance = { type: 'dodge', dodgeDirection: this.direction, dodgeProgress: 'evaded' }
        }

      }
      return;
    }
    fsm.SetState('idle');
  }
};

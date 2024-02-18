import { CharacterController } from '../character/characterController';
import { FiniteStateMachine, State } from '../finiteStateMachine';
import { getAnimAction } from "../utils";
import type { AnimationTypes } from './types';

export class StunnedState extends State<AnimationTypes> {
  private startTime = -1;
  private stunnedTime = -1
  constructor(private charRef: CharacterController) {
    super('stunned');
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    const stance = this.charRef.stance;

    if (stance.type === 'stunned') {
      this.stunnedTime = stance.time * 1000
    } else {
      this.stunnedTime = 1000
    }
    this.startTime = performance.now()

    const curAction = getAnimAction(this.charRef.animations, 'stunned');

    curAction.reset();

    if (prevState) {
      const prevAction = getAnimAction(this.charRef.animations, prevState.name);
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Update(fsm: FiniteStateMachine<AnimationTypes>,) {

    if (this.startTime + this.stunnedTime <= performance.now()) {
      fsm.SetState('idle');
    }
  }
};

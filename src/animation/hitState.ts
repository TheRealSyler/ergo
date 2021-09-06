import { State, FiniteStateMachine } from '../finiteStateMachine';
import { getAnimAction } from "../utils";
import { AnimationTypes } from './types';
import { CharacterController } from '../characterController';
import { LoopOnce } from 'three';

export class HitState extends State<AnimationTypes> {
  private animationDuration = -1;

  constructor(private charRef: CharacterController) {
    super('hit');
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    this.charRef.stance = { type: 'hit' }

    const curAction = getAnimAction(this.charRef.animations, 'hit');
    this.animationDuration = curAction.getClip().duration;
    const mixer = curAction.getMixer();
    mixer.timeScale = this.charRef.stats.hitTime;

    curAction.reset();
    curAction.setLoop(LoopOnce, 1);
    curAction.clampWhenFinished = true;

    if (prevState) {
      const prevAction = getAnimAction(this.charRef.animations, prevState.name);
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Update(fsm: FiniteStateMachine<AnimationTypes>,) {
    const curAction = getAnimAction(this.charRef.animations, 'hit');
    const percent = curAction.time / this.animationDuration;
    if (percent >= 1) {
      const mixer = curAction.getMixer();
      mixer.timeScale = 1
      fsm.SetState('idle')
    }
  }
};

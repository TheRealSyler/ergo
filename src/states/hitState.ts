import { State, FiniteStateMachine } from './finiteStateMachine';
import { getAnimAction } from "../utils";
import { AnimationTypes } from './types';
import { CharacterController } from '../characterController';
import { LoopOnce } from 'three';

export class HitState extends State<AnimationTypes> {

  constructor(private charRef: CharacterController) {
    super('hit');
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    const curAction = getAnimAction(this.charRef.animations, 'hit');
    this.charRef.stance = { type: 'hit' }
    const mixer = curAction.getMixer();
    mixer.timeScale = this.charRef.stats.hitTime;
    mixer.addEventListener('finished', () => {
      fsm.SetState('idle')
      mixer.timeScale = 1;
    });
    if (prevState) {
      const prevAction = getAnimAction(this.charRef.animations, prevState.name);

      curAction.reset();
      curAction.setLoop(LoopOnce, 1);
      curAction.clampWhenFinished = true;
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

};

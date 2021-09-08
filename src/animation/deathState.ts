import { State, FiniteStateMachine } from '../finiteStateMachine';
import { getAnimAction } from "../utils";
import { AnimationTypes } from './types';
import { CharacterController } from '../character/characterController';
import { LoopOnce, } from 'three';

export class DeathState extends State<AnimationTypes> {
  constructor(private charRef: CharacterController) {
    super('death');
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    const curAction = getAnimAction(this.charRef.animations, 'death');
    this.charRef.stance = { type: 'end' }
    curAction.reset();
    curAction.setLoop(LoopOnce, 1);
    curAction.clampWhenFinished = true;
    curAction.enabled = true;
    curAction.setEffectiveTimeScale(1.0);
    curAction.setEffectiveWeight(1.0);

    if (prevState) {
      const prevAction = getAnimAction(this.charRef.animations, prevState.name);
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

};

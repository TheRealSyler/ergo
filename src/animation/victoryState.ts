import { State, FiniteStateMachine } from '../finiteStateMachine';
import { getAnimAction } from "../utils";
import { AnimationTypes } from './types';
import { CharacterController } from '../character/characterController';

export class VictoryState extends State<AnimationTypes> {
  constructor(private charRef: CharacterController) {
    super('death');
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    const curAction = getAnimAction(this.charRef.animations, 'idle'); // TODO add victory Animation
    this.charRef.stance = { type: 'end' }
    if (prevState) {
      const prevAction = getAnimAction(this.charRef.animations, prevState.name);
      curAction.time = 0.0;
      curAction.enabled = true;
      curAction.setEffectiveTimeScale(1.0);
      curAction.setEffectiveWeight(1.0);
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

};

import { LoopOnce } from 'three';
import { State, FiniteStateMachine } from './finiteStateMachine';
import { getAnimAction } from "../utils";
import { Animations, AnimationTypes } from './types';

export class AttackState extends State<AnimationTypes> {

  constructor(private direction: AnimationTypes, private animations: Animations<AnimationTypes>) {
    super(direction);
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    const curAction = getAnimAction(this.animations, this.direction);
    const mixer = curAction.getMixer();
    mixer.addEventListener('finished', () => fsm.SetState('idle'));

    if (prevState) {
      const prevAction = getAnimAction(this.animations, prevState.Name);

      curAction.reset();
      curAction.setLoop(LoopOnce, 1);
      curAction.clampWhenFinished = true;
      curAction.crossFadeFrom(prevAction, 0.2, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update() {
  }
}
;

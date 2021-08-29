
import { Input } from '../characterControllerInput';
import { State, FiniteStateMachine } from './finiteStateMachine';
import { getAnimAction } from "../utils";
import { Animations, AnimationTypes } from './types';


export class IdleState extends State<AnimationTypes> {
  constructor(private input: Input, private animations: Animations<AnimationTypes>) {
    super('idle');
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    const idleAction = getAnimAction(this.animations, 'idle');
    if (prevState) {
      const prevAction = getAnimAction(this.animations, prevState.Name);
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.2, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }

  Exit() {
  }

  Update(fsm: FiniteStateMachine<AnimationTypes>, _: number) {

    if (this.input.keys.attack_left) {
      fsm.SetState('attack_left');
    } else if (this.input.keys.attack_right) {
      fsm.SetState('attack_right');
    } else if (this.input.keys.dodge_left) {
      fsm.SetState('dodge_left');
    } else if (this.input.keys.dodge_right) {
      fsm.SetState('dodge_right');
    } else if (this.input.keys.dodge_down) {
      fsm.SetState('dodge_down');
    }
  }
}
;

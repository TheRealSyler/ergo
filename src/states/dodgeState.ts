
import { Input } from '../characterControllerInput';
import { State, FiniteStateMachine } from './finiteStateMachine';
import { getAnimAction } from "../utils";
import { Animations, AnimationTypes } from './types';

export class DodgeState extends State<AnimationTypes> {
  constructor(
    private direction: AnimationTypes,
    private key: keyof Input['keys'], private input: Input,
    private animations: Animations<AnimationTypes>
  ) {
    super(direction);
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    const curAction = getAnimAction(this.animations, this.direction);
    if (prevState) {
      const prevAction = getAnimAction(this.animations, prevState.Name);

      curAction.enabled = true;

      curAction.time = 0.0;
      curAction.setEffectiveTimeScale(1.0);
      curAction.setEffectiveWeight(1.0);

      curAction.crossFadeFrom(prevAction, 0.1, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(fsm: FiniteStateMachine<AnimationTypes>, timeElapsed: number) {
    if (this.input.keys[this.key]) {
      return;
    }
    fsm.SetState('idle');
  }
}
;

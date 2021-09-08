import { LoopOnce } from 'three';
import { State, FiniteStateMachine } from '../finiteStateMachine';
import { getAnimAction } from "../utils";
import { AnimationTypes, AttackAnimations } from './types';
import { CharacterController } from '../character/characterController';

export class AttackState extends State<AnimationTypes> {
  animationDuration = 0;

  constructor(private direction: AttackAnimations, private charRef: CharacterController) {
    super(direction);
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    this.charRef.stance = { type: 'attack', attackDirection: this.direction, attackProgress: 'started' }

    const curAction = getAnimAction(this.charRef.animations, this.direction);
    const mixer = curAction.getMixer();
    this.animationDuration = curAction.getClip().duration;
    mixer.timeScale = this.charRef.stats.attackSpeed;
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

  Update(fsm: FiniteStateMachine<AnimationTypes>) {
    const curAction = getAnimAction(this.charRef.animations, this.direction);
    const percent = curAction.time / this.animationDuration;

    if (percent >= 1) {
      const mixer = curAction.getMixer();
      mixer.timeScale = 1
      fsm.SetState('idle')
    } else if (percent > 0.85) {
      this.charRef.stance = { type: 'attack', attackDirection: this.direction, attackProgress: 'finished' }
    } else if (percent > 0.7) {
      this.charRef.stance = { type: 'attack', attackDirection: this.direction, attackProgress: 'active' }
    }

  }
};

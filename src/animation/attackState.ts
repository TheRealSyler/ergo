import { LoopOnce } from 'three';
import { State, FiniteStateMachine } from '../finiteStateMachine';
import { getAnimAction } from "../utils";
import { AnimationTypes, AttackAnimations } from './types';
import { CharacterController } from '../characterController';

export class AttackState extends State<AnimationTypes> {

  hasSetToActive = false;
  hasSetToFinished = false;
  animationDuration = 0;

  constructor(private direction: AttackAnimations, private charRef: CharacterController) {
    super(direction);
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    this.hasSetToActive = false;
    this.hasSetToFinished = false;
    this.charRef.stance = { type: 'attack', attackDirection: this.direction, attackProgress: 'started' }
    this.charRef.stamina -= this.charRef.stats.attackStaminaCost;

    const curAction = getAnimAction(this.charRef.animations, this.direction);
    const mixer = curAction.getMixer();
    this.animationDuration = curAction.getClip().duration;
    mixer.timeScale = this.charRef.stats.attackSpeed;
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

  Exit() {
  }

  Update() {
    if (!this.hasSetToActive) {
      const curAction = getAnimAction(this.charRef.animations, this.direction);
      const percent = curAction.time / this.animationDuration;
      if (percent > 0.7) {
        this.hasSetToActive = true
        this.charRef.stance = { type: 'attack', attackDirection: this.direction, attackProgress: 'active' }
      }
    } else if (!this.hasSetToFinished) {
      const curAction = getAnimAction(this.charRef.animations, this.direction);
      const percent = curAction.time / this.animationDuration;
      if (percent > 0.85) {
        this.hasSetToActive = true
        this.charRef.stance = { type: 'attack', attackDirection: this.direction, attackProgress: 'finished' }
      }

    }

  }
}
;

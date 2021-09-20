import { LoopOnce } from 'three';
import { State, FiniteStateMachine } from '../finiteStateMachine';
import { getAnimAction } from "../utils";
import { AnimationTypes, AttackAnimations } from './types';
import { AttackStance, CharacterController } from '../character/characterController';

export const ATTACK_ACTIVE_TIME = 0.7;
export const ATTACK_FINISHED_TIME = 0.85;

export class AttackState extends State<AnimationTypes> {
  animationDuration = 0;

  private stanceRef: AttackStance = { type: 'attack', attackDirection: this.direction, attackProgress: 'started' }
  constructor(private direction: AttackAnimations, private charRef: CharacterController) {
    super(direction);
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    this.charRef.stance = { type: 'attack', attackDirection: this.direction, attackProgress: 'started' }
    this.stanceRef = this.charRef.stance;
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
    } else if (this.stanceRef.attackProgress !== 'hit') {
      if (percent > ATTACK_FINISHED_TIME && this.stanceRef.attackProgress !== 'finished') {
        this.stanceRef.attackProgress = 'finished'
      } else if (percent > ATTACK_ACTIVE_TIME && this.stanceRef.attackProgress !== 'active' && this.stanceRef.attackProgress !== 'finished') {
        this.stanceRef.attackProgress = 'active';
      }
    }
  }
};

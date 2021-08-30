import { LoopOnce } from 'three';
import { State, FiniteStateMachine } from './finiteStateMachine';
import { getAnimAction } from "../utils";
import { AnimationTypes, AttackAnimations } from './types';
import { CharacterController } from '../characterController';

export class AttackState extends State<AnimationTypes> {

  startTime = 0;
  timeToAttack = 800;
  isAttacking = false;

  constructor(private direction: AttackAnimations, private charRef: CharacterController) {
    super(direction);
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    this.isAttacking = false;
    this.startTime = performance.now();

    this.charRef.stance = { type: 'attack', attackDirection: this.direction, attackProgress: 'started' }

    const curAction = getAnimAction(this.charRef.animations, this.direction);
    const mixer = curAction.getMixer();
    mixer.timeScale = 2;
    mixer.addEventListener('finished', () => {
      fsm.SetState('idle')
      mixer.timeScale = 1;
    });

    curAction.setEffectiveTimeScale(2);
    if (prevState) {
      const prevAction = getAnimAction(this.charRef.animations, prevState.Name);

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
    if (!this.isAttacking && performance.now() - this.startTime > this.timeToAttack) {
      this.isAttacking = true

      this.charRef.stance = { type: 'attack', attackDirection: this.direction, attackProgress: 'active' }
    }
  }
}
;

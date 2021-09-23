import { State, FiniteStateMachine } from '../finiteStateMachine';
import { getAnimAction } from "../utils";
import { AnimationTypes } from './types';
import { CharacterController } from '../character/characterController';

export class IdleState extends State<AnimationTypes> {
  constructor(private charRef: CharacterController) {
    super('idle');
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    this.charRef.stance = { type: 'idle' };

    const curAction = getAnimAction(this.charRef.animations, 'idle');
    const mixer = curAction.getMixer();
    mixer.timeScale = 0.8
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

  Exit() {
    const curAction = getAnimAction(this.charRef.animations, 'idle');
    const mixer = curAction.getMixer();
    mixer.timeScale = 1
  }

  Update(fsm: FiniteStateMachine<AnimationTypes>) {

    if (this.charRef.input.keys.attack_left) {
      this.checkStaminaCost(fsm, 'attack_left', this.charRef.stats.attackStaminaCost)
    } else if (this.charRef.input.keys.attack_right) {
      this.checkStaminaCost(fsm, 'attack_right', this.charRef.stats.attackStaminaCost)
    } else if (this.charRef.input.keys.attack_up) {
      this.checkStaminaCost(fsm, 'attack_up', this.charRef.stats.attackStaminaCost)
    } else if (this.charRef.input.keys.attack_down) {
      this.checkStaminaCost(fsm, 'attack_down', this.charRef.stats.attackStaminaCost)
    } else if (this.charRef.input.keys.dodge_left) {
      this.checkStaminaCost(fsm, 'dodge_left', this.charRef.stats.dodgeStaminaCost)
    } else if (this.charRef.input.keys.dodge_right) {
      this.checkStaminaCost(fsm, 'dodge_right', this.charRef.stats.dodgeStaminaCost)
    } else if (this.charRef.input.keys.block_down) {
      this.checkStaminaCost(fsm, 'block_down', this.charRef.stats.blockStaminaCost)
    } else if (this.charRef.input.keys.block_left) {
      this.checkStaminaCost(fsm, 'block_left', this.charRef.stats.blockStaminaCost)
    } else if (this.charRef.input.keys.block_right) {
      this.checkStaminaCost(fsm, 'block_right', this.charRef.stats.blockStaminaCost)
    } else if (this.charRef.input.keys.block_up) {
      this.checkStaminaCost(fsm, 'block_up', this.charRef.stats.blockStaminaCost)
    }
  }

  private checkStaminaCost(fsm: FiniteStateMachine<AnimationTypes>, state: AnimationTypes, cost: number) {
    if (this.charRef.stamina - cost > 0) {
      this.charRef.stamina -= cost
      this.charRef.ui.update('stamina', this.charRef)
      fsm.SetState(state);
    }
  }
};

import { AnimationMixer, Group } from 'three';
import { AttackState } from "./animation/attackState";
import { DodgeState } from "./animation/dodgeState";
import { IdleState } from "./animation/idleState";
import { FiniteStateMachine } from "./finiteStateMachine";
import { EMPTY_INPUT, Input } from './playerInput';
import { Animations, AnimationTypes, AttackAnimations, DodgeAnimations } from './animation/types';
import { AiInput } from './ai/aiCharacterInput';
import { HitState } from './animation/hitState';
import { VictoryState } from './animation/victoryState';
import { DeathState } from './animation/deathState';
import { Player } from './game';
import { FightUI } from './ui/fightUI';
import { LoadedCharacter } from './character/loadCharacter';
import { CharacterStats, createStats } from './character/stats';

export type CharStance = DodgeStance | AttackStance | IdleStance | HitStance | EndStance

export interface DodgeStance {
  type: 'dodge',
  dodgeProgress: 'started' | 'evaded',
  dodgeDirection: DodgeAnimations
}

export interface AttackStance {
  type: 'attack',
  attackProgress: 'started' | 'active' | 'hit' | 'finished',
  attackDirection: AttackAnimations
}
export interface IdleStance {
  type: 'idle'
}
export interface HitStance {
  type: 'hit'
}
export interface EndStance {
  type: 'end'
}

export class CharacterController {
  animations: Animations<AnimationTypes>;
  stateMachine: FiniteStateMachine<AnimationTypes>;
  model: Group;
  input: Input = EMPTY_INPUT;
  private mixer: AnimationMixer;

  stats: CharacterStats;

  public get hp(): number {
    return this.stats.health
  }
  public set hp(v: number) {
    this.stats.health = v;
  }
  public get stamina(): number {
    return this.stats.stamina
  }

  public set stamina(v: number) {
    this.stats.stamina = v;
  }

  stance: CharStance = { type: 'idle' };

  constructor(public player: Player, public ui: FightUI, char: LoadedCharacter) {

    this.mixer = char.mixer;
    this.animations = char.animations;
    this.model = char.model;
    this.stats = createStats(char.character);

    this.stateMachine = new FiniteStateMachine({
      attack_left: new AttackState('attack_left', this),
      attack_right: new AttackState('attack_right', this),
      attack_up: new AttackState('attack_up', this),
      attack_down: new AttackState('attack_down', this),
      dodge_left: new DodgeState('dodge_left', 'dodge_left', this),
      dodge_right: new DodgeState('dodge_right', 'dodge_right', this),
      idle: new IdleState(this),
      hit: new HitState(this),
      victory: new VictoryState(this),
      death: new DeathState(this),
    });
    this.stateMachine.SetState('idle')
  }

  dispose() {
    this.input.dispose();
  }

  pause() {
    this.input.pause()
  }
  unpause() {
    this.input.unpause()
  }

  Update(timeInSeconds: number) {

    this.stateMachine.Update(timeInSeconds);
    if (this.input instanceof AiInput) {
      this.input.update(timeInSeconds)
    }

    this.mixer.update(timeInSeconds);

    if (this.stance.type === 'idle' && this.stamina < this.stats.maxStamina) {
      this.stamina = Math.min(this.stamina + this.stats.staminaRegenRate * timeInSeconds, this.stats.maxStamina)
      this.ui.update('stamina', this)
    }

  }
};

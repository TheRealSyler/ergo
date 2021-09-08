import { AnimationMixer, Group } from 'three';
import { NumberRange } from './utils';
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
import { LoadedCharacter } from './loadCharacter';

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
// TODO rename this.
type HealthOrStamina = {
  max: number;
  current: number;
};

export interface CharStats {
  /** The time the ai does nothing/waits for the player to attack. */
  aiTimeToAttack: NumberRange
  /**The time it takes for the ai to react to the player attack. */
  aiDodgeReactionTime: NumberRange
  /**The attack animation speed. */
  attackSpeed: number
  /**The time it takes to go from idle to dodge state. */
  dodgeSpeed: number
  /** The hit animation speed. */
  hitTime: number

  /**Stamina Regeneration Per second */
  staminaRegenRate: number

  attackStaminaCost: number
  dodgeStaminaCost: number

  damage: number

  health: HealthOrStamina
  stamina: HealthOrStamina
}

export class CharacterController {
  animations: Animations<AnimationTypes>;
  stateMachine: FiniteStateMachine<AnimationTypes>;
  model: Group;
  mixer: AnimationMixer;
  input: Input = EMPTY_INPUT;
  base = new Group();

  stats: CharStats = {
    aiDodgeReactionTime: new NumberRange(0.1, 0.8),
    aiTimeToAttack: new NumberRange(0.5, 1.5),
    attackSpeed: 1,
    dodgeSpeed: 0.2,
    hitTime: 1.5,
    staminaRegenRate: 10,
    attackStaminaCost: 50,
    dodgeStaminaCost: 15,
    damage: 55,
    health: {
      current: 250,
      max: 250
    },
    stamina: {
      current: 100,
      max: 100
    },
  }

  public get hp(): number {
    return this.stats.health.current
  }
  public set hp(v: number) {
    this.stats.health.current = v;
  }
  public get stamina(): number {
    return this.stats.stamina.current
  }

  public set stamina(v: number) {
    this.stats.stamina.current = v;
  }

  stance: CharStance = { type: 'idle' };

  constructor(public player: Player, public ui: FightUI, char: LoadedCharacter) {

    this.mixer = char.mixer;
    this.animations = char.animations;
    this.model = char.model;

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

    if (this.stance.type === 'idle' && this.stamina < this.stats.stamina.max) {
      this.stamina = Math.min(this.stamina + this.stats.staminaRegenRate * timeInSeconds, this.stats.stamina.max)
      this.ui.update('stamina', this)
    }

  }
};

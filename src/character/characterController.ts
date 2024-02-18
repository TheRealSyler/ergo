import { AnimationMixer, Group } from 'three'
import { AiInput } from '../ai/aiCharacterInput'
import { AttackState } from '../animation/attackState'
import { BlockState } from '../animation/blockState'
import { DeathState } from '../animation/deathState'
import { DodgeState } from '../animation/dodgeState'
import { HitState } from '../animation/hitState'
import { IdleState } from '../animation/idleState'
import { StunnedState } from '../animation/stunnedState'
import type { AnimationTypes, Animations, AttackAnimations, BlockAnimations, DodgeAnimations } from '../animation/types'
import { VictoryState } from '../animation/victoryState'
import { FiniteStateMachine } from '../finiteStateMachine'
import type { Player } from '../game'
import { EMPTY_INPUT, type Input } from '../playerInput'
import { FightUI } from '../ui/fightUI'
import type { LoadedCharacter } from './loadCharacter'
import { createStats, type CharacterStats } from './stats'

export type CharStance = DodgeStance | AttackStance | IdleStance | HitStance | EndStance | BlockStance | StunnedStance

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
export interface StunnedStance {
  type: 'stunned',
  time: number
}
export interface BlockStance {
  type: 'block'
  blockDirection: BlockAnimations
  blockProgress: 'started' | 'active'
}
export interface EndStance {
  type: 'end'
}

export class CharacterController {
  animations: Animations<AnimationTypes>
  stateMachine: FiniteStateMachine<AnimationTypes>
  model: Group
  input: Input = EMPTY_INPUT
  private mixer: AnimationMixer

  public get hp(): number {
    return this.stats.health
  }
  public set hp(v: number) {
    this.stats.health = v
  }
  public get stamina(): number {
    return this.stats.stamina
  }

  public set stamina(v: number) {
    this.stats.stamina = v
  }

  stance: CharStance = { type: 'idle' }
  private initialHpPercent = 1
  private initialStaminaPercent = 1
  constructor(public player: Player, public ui: FightUI, char: LoadedCharacter, public stats: CharacterStats = createStats(char.character)) {

    this.mixer = char.mixer
    this.animations = char.animations
    this.model = char.model
    this.initialHpPercent = this.hp / this.stats.maxHealth
    this.initialStaminaPercent = this.stamina / this.stats.maxStamina
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
      block_down: new BlockState('block_down', this),
      block_right: new BlockState('block_right', this),
      block_left: new BlockState('block_left', this),
      block_up: new BlockState('block_up', this),
      stunned: new StunnedState(this)
    })
    this.stateMachine.SetState('idle')
  }

  restart() {
    this.input = EMPTY_INPUT
    this.stateMachine.SetState('idle')
    this.stamina = this.stats.maxStamina * this.initialStaminaPercent
    this.hp = this.stats.maxHealth * this.initialHpPercent
  }

  dispose() {
    this.input.dispose()
  }

  pause() {
    this.input.pause()
  }
  unpause() {
    this.input.unpause()
  }

  update(timeInSeconds: number) {

    this.stateMachine.Update(timeInSeconds)
    if (this.input instanceof AiInput) {
      this.input.update(timeInSeconds)
    }

    this.mixer.update(timeInSeconds)

    if (this.stance.type === 'idle' && this.stamina < this.stats.maxStamina) {
      this.stamina = Math.min(this.stamina + this.stats.staminaRegenRate * timeInSeconds, this.stats.maxStamina)
      this.ui.update('stamina', this)
    }

  }
}

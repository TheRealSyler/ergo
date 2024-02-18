import { CharacterController } from '../character/characterController'
import { BLOCK_DIRECTIONS } from '../fight/fightController'
import { FiniteStateMachine, State } from '../finiteStateMachine'
import { checkChance, randomInRange } from '../utils'
import type { AiStates } from './aiCharacterInput'

export class AiIdleState extends State<AiStates> {
  private timeToAttack = -1

  constructor(private aiChar: CharacterController, private playerChar: CharacterController) {
    super('ai_idle')
  }
  Enter() {
    if (this.aiChar.input.aiSuccessfullyBlocked) {
      this.timeToAttack = 0
      this.aiChar.input.aiSuccessfullyBlocked = false
    } else {
      this.timeToAttack = randomInRange(this.playerChar.stats.aiTimeToAttack)
    }
  }
  Update(fsm: FiniteStateMachine<AiStates>, timeElapsed: number) {
    switch (this.playerChar.stance.type) {
    case 'idle':
      if (this.timeToAttack >= 0) {

        this.timeToAttack -= timeElapsed

        if (this.timeToAttack <= 0) {
          fsm.SetState('ai_attacking')
        }
      }
      return
    case 'attack':
      if (checkChance(this.aiChar.stats.aiUseDodge)) {
        fsm.SetState('ai_dodging')
      } else {
        this.aiChar.input.aiBlockDirection = BLOCK_DIRECTIONS[this.playerChar.stance.attackDirection]
        fsm.SetState('ai_block')
      }
      return
    }
  }
}

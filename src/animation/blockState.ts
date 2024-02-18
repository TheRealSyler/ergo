import { LoopOnce } from 'three'
import { CharacterController, type BlockStance } from '../character/characterController'
import { FiniteStateMachine, State } from '../finiteStateMachine'
import { getAnimAction } from '../utils'
import type { AnimationTypes, BlockAnimations } from './types'

export const BLOCK_TIME = 0.15
export class BlockState extends State<AnimationTypes> {
  private animationDuration = 0
  private stanceRef: BlockStance = { type: 'block', blockDirection: this.direction, blockProgress: 'started' }
  constructor(private direction: BlockAnimations, private charRef: CharacterController) {
    super(direction)
  }

  Enter(fsm: FiniteStateMachine<AnimationTypes>, prevState?: State<AnimationTypes>) {
    this.charRef.stance = { type: 'block', blockDirection: this.direction, blockProgress: 'started' }
    this.stanceRef = this.charRef.stance
    const curAction = getAnimAction(this.charRef.animations, this.direction)
    const mixer = curAction.getMixer()
    this.animationDuration = curAction.getClip().duration
    mixer.timeScale = this.charRef.stats.attackSpeed
    curAction.reset()
    curAction.setLoop(LoopOnce, 1)
    curAction.clampWhenFinished = true

    if (prevState) {
      const prevAction = getAnimAction(this.charRef.animations, prevState.name)

      curAction.crossFadeFrom(prevAction, 0.2, true)
      curAction.play()
    } else {
      curAction.play()
    }
  }

  Update(fsm: FiniteStateMachine<AnimationTypes>) {
    const curAction = getAnimAction(this.charRef.animations, this.direction)
    const percent = curAction.time / this.animationDuration
    if (percent >= 1) {
      const mixer = curAction.getMixer()
      mixer.timeScale = 1
      fsm.SetState('idle')
    } else if (this.stanceRef.blockProgress !== 'active' && percent > BLOCK_TIME) {
      this.stanceRef.blockProgress = 'active'
    }
  }

}

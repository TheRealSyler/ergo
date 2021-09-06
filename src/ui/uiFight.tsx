import { h } from 'dom-chef'
import { CharacterController } from '../characterController'
import { toPx } from '../utils'
import { MAIN_UI_ELEMENT } from './ui'

import './uiFight.sass'

type Player = 'player1' | 'player2'

type HUDEl = { [key in Player]: HTMLElement }

export class UiFight {
  private health: HUDEl = {
    player1: <div className='bar health'></div>,
    player2: <div className='bar health'></div>
  }
  private stamina: HUDEl = {
    player1: <div className='bar stamina'></div>,
    player2: <div className='bar stamina'></div>
  }

  private main: HTMLElement
  constructor() {
    MAIN_UI_ELEMENT.textContent = ''

    this.main = <div className="hud">
      {this.health.player1}
      {this.stamina.player1}
      {this.health.player2}
      {this.stamina.player2}
    </div>

    MAIN_UI_ELEMENT.appendChild(this.main)
  }
  private barWidth = 100;

  update(type: 'health' | 'stamina', player: Player, ref: CharacterController) {
    const amount = ref.stats[type].current
    const max = ref.stats[type].max
    this[type][player].textContent = amount.toFixed(0)
    this[type][player].style.width = toPx(Math.max((amount / max) * this.barWidth, 0))
  }

  endScreen(goToMainMenu: () => void, restart: () => void) {
    const a = <div className="end-screen">

      <div className="button" onClick={goToMainMenu}>Main Menu</div>
      <div className="button" onClick={() => {
        restart()
        a.remove()
      }}>Restart</div>

    </div>
    MAIN_UI_ELEMENT.appendChild(a)
  }
}
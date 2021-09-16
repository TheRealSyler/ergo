import { h } from 'dom-chef'
import { CharacterController } from '../character/characterController'
import { toPx } from '../utils'
import { MAIN_UI_ELEMENT } from './ui'

import './fightUI.sass'
import { Player } from '../game'

export class FightUI {
  private health: Record<Player, HTMLElement> = {
    player1: <div className='fight-bar health'></div>,
    player2: <div className='fight-bar health'></div>
  }
  private stamina: Record<Player, HTMLElement> = {
    player1: <div className='fight-bar stamina'></div>,
    player2: <div className='fight-bar stamina'></div>
  }

  constructor() {
    this.HUD()
  }
  private barWidth = 100;

  HUD() {
    MAIN_UI_ELEMENT.textContent = ''

    MAIN_UI_ELEMENT.appendChild(<div className="fight-hud">
      {this.health.player1}
      {this.stamina.player1}
      {this.health.player2}
      {this.stamina.player2}
    </div>)
  }

  update(type: 'health' | 'stamina', ref: CharacterController) {
    const amount = ref.stats[type]
    const maxType = type === 'health' ? 'maxHealth' : 'maxStamina'
    const max = ref.stats[maxType]
    this[type][ref.player].textContent = amount.toFixed(0)
    this[type][ref.player].style.width = toPx(Math.max((amount / max) * this.barWidth, 0))
  }

  endScreen(restart: () => void, exitToMainMenu: () => void) {
    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(<div className="fight-end-screen">

      <div className="button" onClick={exitToMainMenu}>Main Menu</div>
      <div className="button" onClick={() => {
        restart()
        this.HUD()
      }}>Restart</div>

    </div>)
  }

  pauseMenu(resume: () => void, exitToMainMenu: () => void) {
    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(<div className="fight-pause-menu">

      <div className="button" onClick={exitToMainMenu}>Main Menu</div>
      <div className="button" onClick={() => {
        resume()
        this.HUD()
      }}>Resume</div>

    </div>)
  }
}

export function victoryOrLossUI(victory: boolean) {
  // TODO add animation etc
  MAIN_UI_ELEMENT.appendChild(<div className={`fight-end-result ${victory ? 'fight-victory' : 'fight-loss'}`}>
    {victory ? 'VICTORY' : 'LOSS'}
  </div>)
}
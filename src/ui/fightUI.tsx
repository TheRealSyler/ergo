import { h } from 'dom-chef'
import { CharacterController } from '../character/characterController'
import { toPx, wait } from '../utils'
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
  private fightStartTextEL = <span ></span>
  private fightStartEL = <div className="fight-start">{this.fightStartTextEL}</div>

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
        this.HUD()
        restart()
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

  async startFight(start: () => void) {
    MAIN_UI_ELEMENT.appendChild(this.fightStartEL)
    this.fightStartEL.classList.remove('fight-start-animate')
    this.fightStartEL.classList.add('fight-start-animate')
    this.fightStartTextEL.textContent = '3'
    await wait(1000)
    MAIN_UI_ELEMENT.appendChild(this.fightStartEL)
    this.fightStartTextEL.textContent = '2'
    this.fightStartEL.classList.remove('fight-start-animate')
    this.fightStartEL.classList.add('fight-start-animate')
    await wait(1000)
    MAIN_UI_ELEMENT.appendChild(this.fightStartEL)
    this.fightStartTextEL.textContent = '1'
    this.fightStartEL.classList.remove('fight-start-animate')
    this.fightStartEL.classList.add('fight-start-animate')
    await wait(1000)
    MAIN_UI_ELEMENT.appendChild(this.fightStartEL)
    this.fightStartTextEL.textContent = 'FIGHT'
    this.fightStartEL.classList.remove('fight-start-animate')
    this.fightStartEL.classList.add('fight-start-animate')
    start()
    await wait(1000)
    this.fightStartEL.remove()
  }
}

export function victoryOrLossUI(victory: boolean) {
  // TODO add animation etc
  MAIN_UI_ELEMENT.appendChild(<div className={`fight-end-result ${victory ? 'fight-victory' : 'fight-loss'}`}>
    {victory ? 'VICTORY' : 'LOSS'}
  </div>)
}
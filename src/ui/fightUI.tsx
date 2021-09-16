import { h } from 'dom-chef'
import { CharacterController } from '../character/characterController'
import { wait } from '../utils'
import { MAIN_UI_ELEMENT } from './ui'

import './fightUI.sass'
import { Player } from '../game'
import { BarComponent } from './barComponent'

export class FightUI {
  private health: Record<Player, BarComponent> = {
    player1: new BarComponent('health', 0),
    player2: new BarComponent('health', 0)
  }
  private stamina: Record<Player, BarComponent> = {
    player1: new BarComponent('stamina', 0),
    player2: new BarComponent('stamina', 0)
  }
  private fightStartTextEL = <span ></span>
  private fightStartEL = <div className="fight-start center-fixed">{this.fightStartTextEL}</div>

  constructor() {
    this.HUD()
  }

  HUD() {
    MAIN_UI_ELEMENT.textContent = ''

    MAIN_UI_ELEMENT.appendChild(<div className="fight-hud fixed">
      <div className="fight-bars">
        {this.health.player1.getEl()}
        {this.stamina.player1.getEl()}

        {this.health.player2.getEl()}
        {this.stamina.player2.getEl()}
      </div>
    </div>)
  }

  update(type: 'health' | 'stamina', ref: CharacterController) {
    const current = ref.stats[type]
    const maxType = type === 'health' ? 'maxHealth' : 'maxStamina'
    const max = ref.stats[maxType]
    this[type][ref.player].set(current, max)
  }

  endScreen(_restart: () => void, exitToMainMenu: () => void) {
    // TODO clean up this mess and add shortcuts to pause menu and use keybindings.
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        restart()
      } else if (e.key === 'Escape') {
        mainMenu()
      }
    }
    const mainMenu = () => {
      removeListener()
      exitToMainMenu()
    }
    const restart = () => {
      removeListener()
      this.HUD()
      _restart()
    }
    window.addEventListener('keydown', listener)
    const removeListener = () => window.removeEventListener('keydown', listener)
    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(<div className="fight-end-screen">

      <div className="button" onClick={mainMenu}>[ESCAPE] Main Menu</div>
      <div className="button" onClick={restart}>[ENTER] Restart</div>

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
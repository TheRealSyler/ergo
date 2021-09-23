import { h } from 'dom-chef'
import { CharacterController } from '../character/characterController'
import { TextUI, wait } from '../utils'
import { MAIN_UI_ELEMENT } from './ui'

import './fightUI.sass'
import { Player } from '../game'
import { BarComponent } from './barComponent'
import { getKeybinding, getKeybindingUI } from '../keybindings'
import { Difficulty } from '../character/stats'

type FightUIMenus = 'restart' | 'resume' | 'mainMenu' | 'inventory' | 'run' | 'options'
export class FightUI {
  private health: Record<Player, BarComponent> = {
    player1: new BarComponent('health', 0),
    player2: new BarComponent('health', 0)
  }
  private stamina: Record<Player, BarComponent> = {
    player1: new BarComponent('stamina', 0),
    player2: new BarComponent('stamina', 0)
  }
  private difficultyEL = <span className="fixed fight-difficulty" ></span>
  private fightStartTextEL = <span ></span>
  private fightStartEL = <div className="fight-start center-fixed">{this.fightStartTextEL}</div>

  private menuListener = (e: KeyboardEvent) => {
    e.preventDefault()
    switch (e.key.toUpperCase()) {
      case getKeybinding('Fight', 'MenuRestart'):
        this.callMenuFunc('restart')
        break;
      case getKeybinding('Fight', 'MenuMainMenu'):
        this.callMenuFunc('mainMenu')
        break;
      case getKeybinding('Fight', 'MenuResume'):
        this.HUD()
        this.callMenuFunc('resume')
        break;
      case getKeybinding('Fight', 'MenuInventory'):
        this.callMenuFunc('inventory', false)
        break;
      case getKeybinding('Fight', 'MenuRun'):
        this.callMenuFunc('run')
        break;
      case getKeybinding('Options', 'Toggle'):
        this.callMenuFunc('options')
        break;
    }
  }

  private menuFunctions: Partial<Record<FightUIMenus, () => void>> = {}

  private addMenuListener(listeners: Partial<Record<FightUIMenus, () => void>>) {
    this.menuFunctions = listeners
    window.addEventListener('keydown', this.menuListener)
  }

  private callMenuFunc = (type: FightUIMenus, removeListener = true) => {
    if (removeListener) window.removeEventListener('keydown', this.menuListener)
    const func = this.menuFunctions[type]
    func && func()
  }

  constructor() {
    this.HUD()
  }

  showDifficulty(difficulty: Difficulty) {
    this.difficultyEL.textContent = `aiDodge: ${difficulty.aiDodgeChance}% aiBlock: ${difficulty.aiBlockChance}% aiUseDodge: ${difficulty.aiUseDodge}% playerDodgeTime: ${difficulty.playerTimeToDodge}ms playerBlockTime: ${difficulty.playerTimeToBlock}ms`
  }
  HUD() {
    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(this.difficultyEL)
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

  menu(menus: Partial<Record<FightUIMenus, () => void>>) {
    this.addMenuListener(menus)

    const items: JSX.Element[] = []

    for (const key in menus) {
      if (Object.prototype.hasOwnProperty.call(menus, key)) {
        if (menus[key as FightUIMenus]) {
          items.push(<div className="button" onClick={() => this.callMenuFunc(key as FightUIMenus)}>{this.menuKeyToKeybindingUI(key as FightUIMenus)} {TextUI(key)}</div>)
        }
      }
    }

    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(<div className="fight-menu">
      {items}
    </div>)
  }

  private menuKeyToKeybindingUI(key: FightUIMenus): string {
    switch (key) {
      case 'mainMenu':
        return getKeybindingUI('Fight', 'MenuMainMenu')
      case 'restart':
        return getKeybindingUI('Fight', 'MenuRestart')
      case 'resume':
        return getKeybindingUI('Fight', 'MenuResume')
      case 'inventory':
        return getKeybindingUI('Fight', 'MenuInventory')
      case 'run':
        return getKeybindingUI('Fight', 'MenuRun')
      case 'options':
        return getKeybindingUI('Options', 'Toggle')
    }
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
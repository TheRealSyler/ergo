import { h } from 'dom-chef'
import { TextUI } from '../utils'
import { MAIN_UI_ELEMENT } from './ui'

import './pauseMenuUI.sass'

import { getKeybinding, getKeybindingUI } from '../keybindings'

type PauseMenuUIMenus = 'restart' | 'resume' | 'mainMenu' | 'inventory' | 'run' | 'options'
type PauseMenuFunctions = Partial<Record<PauseMenuUIMenus, (addMenuListeners: () => void) => void>>

export class PauseMenuUI {

  private menuListener = (e: KeyboardEvent) => {
    e.preventDefault()
    switch (e.key.toUpperCase()) {
    case getKeybinding('PauseMenu', 'RestartFight'):
      this.callMenuFunc('restart')
      break
    case getKeybinding('PauseMenu', 'MenuMain'):
      this.callMenuFunc('mainMenu')
      break
    case getKeybinding('PauseMenu', 'Resume'):
      this.callMenuFunc('resume')
      break
    case getKeybinding('PauseMenu', 'Inventory'):
      this.callMenuFunc('inventory')
      break
    case getKeybinding('PauseMenu', 'RunFromFight'):
      this.callMenuFunc('run')
      break
    case getKeybinding('PauseMenu', 'Options'):
      this.callMenuFunc('options')
      break
    }
  }
  // to hide the pause menu overwrite the MAIN_UI_ELEMENT and the menu listeners get automagically hidden by calling most of the menu options, read call menu func method.
  // hide()

  private menuFunctions: PauseMenuFunctions = {}

  private addMenuListener(listeners: PauseMenuFunctions) {
    this.menuFunctions = listeners
    window.addEventListener('keydown', this.menuListener)
  }

  private callMenuFunc = (type: PauseMenuUIMenus) => {
    window.removeEventListener('keydown', this.menuListener)
    const func = this.menuFunctions[type]
    func && func(() => this.addMenuListener(this.menuFunctions))
  }

  show(menus: PauseMenuFunctions) {
    this.addMenuListener(menus)

    const items: JSX.Element[] = []

    for (const key in menus) {
      if (Object.prototype.hasOwnProperty.call(menus, key)) {
        if (menus[key as PauseMenuUIMenus]) {
          items.push(<div className="button" onClick={() => this.callMenuFunc(key as PauseMenuUIMenus)}>{this.menuKeyToKeybindingUI(key as PauseMenuUIMenus)} {TextUI(key)}</div>)
        }
      }
    }

    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(<div className="pause-menu">
      {items}
    </div>)
  }

  private menuKeyToKeybindingUI(key: PauseMenuUIMenus): string {
    switch (key) {
    case 'mainMenu':
      return getKeybindingUI('PauseMenu', 'MenuMain')
    case 'restart':
      return getKeybindingUI('PauseMenu', 'RestartFight')
    case 'resume':
      return getKeybindingUI('PauseMenu', 'Resume')
    case 'inventory':
      return getKeybindingUI('PauseMenu', 'Inventory')
    case 'run':
      return getKeybindingUI('PauseMenu', 'RunFromFight')
    case 'options':
      return getKeybindingUI('PauseMenu', 'Options')
    }
  }
}

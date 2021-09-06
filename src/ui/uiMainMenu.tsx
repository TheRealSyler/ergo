import { h } from 'dom-chef'
import { MAIN_UI_ELEMENT } from './ui'
import './uiMainMenu.sass'

export class UiMainMenu {
  main: HTMLElement
  constructor(newGameOnClick: () => void) {
    MAIN_UI_ELEMENT.textContent = ''

    this.main = <div className="main-menu">
      <div className="main-menu-button button" onClick={newGameOnClick}>New Game</div>
      <div className="main-menu-button button">Continue</div>
      <div className="main-menu-button button">Load Game</div>
      <div className="main-menu-button button">Options</div>
    </div>


    MAIN_UI_ELEMENT.appendChild(this.main)
  }
}
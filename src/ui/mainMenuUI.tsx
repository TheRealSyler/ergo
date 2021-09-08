import { h } from 'dom-chef'
import { MAIN_UI_ELEMENT } from './ui'
import './mainMenuUI.sass'
import { Game } from '../game'

export class UiMainMenu {
  main: HTMLElement
  constructor(goToFight: Game['goToFight']) {
    MAIN_UI_ELEMENT.textContent = ''

    this.main = <div className="main-menu">
      <div className="main-menu-button button" onClick={() => goToFight()}>New Game</div>
      <div className="main-menu-button button">Continue</div>
      <div className="main-menu-button button">Load Game</div>
      <div className="main-menu-button button">Options</div>
    </div>


    MAIN_UI_ELEMENT.appendChild(this.main)
  }
}
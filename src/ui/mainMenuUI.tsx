import { h } from 'dom-chef'
import { MAIN_UI_ELEMENT } from './ui'
import './mainMenuUI.sass'
import { Game } from '../game'
import { CustomBattleUI } from './customBattleUI'

export function UiMainMenu(goToFight: Game['goToFight']) {

  MAIN_UI_ELEMENT.textContent = ''

  MAIN_UI_ELEMENT.appendChild(<div className="main-menu">
    <div className="main-menu-button button" onClick={() => goToFight()}>New Game</div>
    <div className="main-menu-button button">Continue</div>
    <div className="main-menu-button button">Load Game</div>
    <div className="main-menu-button button" onClick={() => CustomBattleUI(goToFight)}>Custom Battle</div>
    <div className="main-menu-button button">Options</div>
  </div>)

}
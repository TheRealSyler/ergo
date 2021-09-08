import { h } from 'dom-chef'
import { Character } from '../character/character'
import { ITEMS } from '../character/items'
import { CharacterClass } from '../character/stats'
import { Game, Player } from '../game'
import './customBattleUI.sass'
import { UiMainMenu } from './mainMenuUI'
import { MAIN_UI_ELEMENT } from './ui'

export function CustomBattleUI(goToFight: Game['goToFight']) {
  MAIN_UI_ELEMENT.textContent = ''
  const player1: Character = {
    class: 'base',
    items: {}
  }
  const player2: Character = {
    class: 'base',
    items: {}
  }
  let humanPlayer: Player = 'player1'
  MAIN_UI_ELEMENT.appendChild(<div className="custom-battle" >
    <div className="custom-battle-main">

      {playerSelector(player1)}
      {playerSelector(player2)}
    </div>
    <div className="custom-battle-bottom">

      <button className="button" onClick={() => UiMainMenu(goToFight)}>Main Menu</button>
      <button className="button" onClick={() => goToFight(humanPlayer, player1, player2)}>Fight</button>
    </div>
  </div>)
}

function playerSelector(player: Character) {

  const classes: Record<CharacterClass, any> = {
    awd: null,
    base: null
  }
  // TODO select default option
  return <div>
    <label >Select Glove:</label>
    <select>
      <option value="None" onClick={() => {
        player.items.gloves = undefined
      }}> None</option>
      {createOptions(ITEMS.gloves, (key) => {
        player.items.gloves = key as any
      })}
    </select>
    <br />
    <label >Select Sword:</label>
    <select>
      <option value="None" onClick={() => {
        player.items.weapon = undefined
      }}> None</option>
      {createOptions(ITEMS.weapon, (key) => {
        player.items.weapon = key as any
      })}
    </select>
    <br />
    <label >Select Class:</label>
    <select>
      {createOptions(classes, (key) => {
        player.class = key as any
      }, 'base')}
    </select>
  </div>
}

function createOptions(obj: Record<string, any>, onClick: (key: string) => void, defaultKey?: string) {
  const items = []
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      items.push(<option selected={defaultKey === key} value={key} onClick={() => onClick(key)}>{key}</option>)
    }
  }
  return items
}

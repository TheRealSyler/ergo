import { h } from 'dom-chef'
import { createCharacter, type Character } from '../character/character'
import { ITEMS, type ItemName } from '../character/items'
import { createStats, type CharacterStats } from '../character/stats'
import type { Game, Player } from '../game'
import type { RoomNames } from '../rooms/rooms'
import './customBattleUI.sass'
import { InventoryUI, type Inventory } from './inventoryUI'
import { MainMenuUi } from './mainMenuUI'
import { MAIN_UI_ELEMENT } from './ui'

export function CustomBattleUI(goToFight: Game['goToFight']) {
  MAIN_UI_ELEMENT.textContent = ''

  let stage: RoomNames = 'test'
  let humanPlayer: Player = 'player1'
  const allItems = (Object.keys(ITEMS) as ItemName[]).filter((key) => {
    const type = ITEMS[key].type
    return type !== 'consumable' && type !== 'quest'
  })
  const mainEL = <div className="custom-battle-main"></div>
  const player1: Character = createCharacter()
  const inventory1: Inventory = { items: [...allItems] }
  const stats1: CharacterStats = createStats(player1)

  const inventoryUI1 = new InventoryUI(inventory1, player1, stats1, false, mainEL)

  const player2: Character = createCharacter()
  const inventory2: Inventory = { items: [...allItems] }
  const stats2: CharacterStats = createStats(player1)
  const inventoryUI2 = new InventoryUI(inventory2, player2, stats2, false, mainEL)
  inventoryUI1.show()
  const rooms: Record<RoomNames, number> = {
    basic: 0,
    test: 0,
    test3: 0
  }
  const p1SelectEl = <div className="button custom-battle-selected" onClick={() => {
    p1SelectEl.classList.add('custom-battle-selected')
    p2SelectEl.classList.remove('custom-battle-selected')
    inventoryUI2.hide()
    inventoryUI1.show()
  }}>Player 1</div>
  const p2SelectEl = <div className="button" onClick={() => {
    p2SelectEl.classList.add('custom-battle-selected')
    p1SelectEl.classList.remove('custom-battle-selected')
    inventoryUI1.hide()
    inventoryUI2.show()
  }}>Player 2</div>
  MAIN_UI_ELEMENT.appendChild(<div className="custom-battle fixed" >
    <div className="custom-battle-top">
      <label >Select Stage:</label>
      <select>
        {createOptions(rooms, (key) => {
          stage = key as RoomNames
        }, stage)}
      </select>
      {p1SelectEl}
      {p2SelectEl}

    </div>
    {mainEL}

    <div className="custom-battle-bottom">

      <button className="button" onClick={() => MainMenuUi(goToFight)}>Main Menu</button>
      <button className="button" onClick={() => goToFight(humanPlayer, player1, player2, stage)}>Fight</button>
    </div>
  </div>)
}

function createOptions<T extends string>(obj: Record<T, any>, onClick: (key: string) => void, defaultKey?: T) {
  const items = []
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      items.push(<option selected={defaultKey === key} value={key} onClick={() => onClick(key)}>{key}</option>)
    }
  }
  return items
}

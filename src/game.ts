import { Campaign } from './campaign/campaign'
import { createCharacter, type Character } from './character/character'
import { LoadFight } from './fight/loadFight'
import type { RoomNames } from './rooms/rooms'
import { MainMenuUi } from './ui/mainMenuUI'

export type Player = 'player1' | 'player2'

export class Game {

  startInFight = true

  constructor() {
    // OptionsUI()
    new Campaign()
    // new StandaloneDungeon(this, {
    //   rooms: { awd: { fight: { char: createCharacter() }, doors: {}, name: 'test', objectInfos: [] } },
    //   entryDir: 'north',
    //   firstRoom: 'awd'
    // })
    // this.goToFight()
    // if (this.startInFight) {
    // this.goToFight()
    // } else {
    // this.goToMainMenu()
    // }
    // CustomBattleUI(this.goToFight)
  }
  goToMainMenu() {
    MainMenuUi(this.goToFight.bind(this))
  }

  goToFight = async (humanPlayer?: Player, player1?: Character, player2?: Character, room?: RoomNames) => {
    await LoadFight(humanPlayer || 'player1', this, player1 || createCharacter(), player2 || createCharacter(), room || 'test')
  }

}

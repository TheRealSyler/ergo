import { Character } from './character/character';
import { Dungeon } from './dungeon/dungeon';
import { DungeonRoom } from './dungeon/dungeonRoom';
import { FightController } from './fight/fightController';
import { LoadFight } from './fight/loadFight';
import { RoomNames } from './rooms/rooms';
import { CustomBattleUI } from './ui/customBattleUI';
import { UiMainMenu } from './ui/mainMenuUI';

export type Player = 'player1' | 'player2'

export class Game {

  startInFight = true

  constructor() {

    const room1 = new DungeonRoom('test')
    const room2 = new DungeonRoom('basic')
    const room3 = new DungeonRoom('test')
    const room4 = new DungeonRoom('basic')
    room1.addDoor('north', room2)
    room2.addDoor('south', room1)
    room2.addDoor('east', room3)
    room3.addDoor('west', room2)
    room3.addDoor('south', room4)
    room4.addDoor('north', room3)
    room4.addDoor('west', room1)
    room1.addDoor('east', room4)

    room1.obstacles.push('test')

    new Dungeon(room1)

    // if (this.startInFight) {
    //   this.goToFight()
    // } else {
    //   this.goToMainMenu()
    // }
  }
  goToMainMenu() {
    CustomBattleUI(this.goToFight.bind(this))
  }

  async goToFight(humanPlayer?: Player, player1?: Character, player2?: Character, stage?: RoomNames) {
    await LoadFight(humanPlayer || 'player1', this, player1 || { class: 'base', items: {} }, player2 || { class: 'base', items: {} }, stage || 'test');
  }

}

import { Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { Character } from './character/character';
import { Dungeon } from './dungeon/dungeon';
import { DungeonRooms } from './dungeon/dungeonRoom';
import { LoadFight } from './fight/loadFight';
import { RoomNames } from './rooms/rooms';
import { MainMenuUi } from './ui/mainMenuUI';

export type Player = 'player1' | 'player2'

export class Game {

  startInFight = true

  constructor() {

    const rooms: DungeonRooms<'awd' | 'awd2' | 'awd3'> = {
      awd: {
        doors: {
          north: { type: 'room', roomId: 'awd2', asset: 'basic' },
          south: { type: 'exit', asset: 'basic' },
          west: { type: 'room', roomId: 'awd3', asset: 'basic' }
        },
        fight: { char: { class: 'base', items: { gloves: 'BasicGloves' } }, loot: { items: ['SuperGloves'] } },
        objectInfos: [{ asset: 'chest', items: { items: ['SuperGloves', 'BasicSword'], size: 12 }, position: new Vector3(-2, 0, 0), rotation: new Vector3(0, degToRad(-90)) }],
        name: 'test'
      },
      awd2: {
        objectInfos: [],
        name: 'test3',
        doors: {
          south: { type: 'room', roomId: 'awd', asset: 'basic' }
        }
      },
      awd3: {
        doors: { east: { roomId: 'awd', type: 'room', asset: 'basic' } },
        name: 'basic',
        fight: { char: { class: 'awd', items: { gloves: 'BasicGloves', weapon: 'BasicSword' } }, loot: { items: [] } },
        objectInfos: []
      }
    }

    new Dungeon(rooms, 'awd', 'north')
    // this.goToFight()

    // if (this.startInFight) {
    // this.goToFight()
    // } else {
    // this.goToMainMenu()
    // }
  }
  goToMainMenu() {
    MainMenuUi(this.goToFight.bind(this))
  }

  async goToFight(humanPlayer?: Player, player1?: Character, player2?: Character, stage?: RoomNames) {
    await LoadFight(humanPlayer || 'player1', this, player1 || { class: 'base', items: { weapon: 'BasicSword' } }, player2 || { class: 'base', items: { weapon: 'BasicSword' } }, stage || 'test');
  }

}

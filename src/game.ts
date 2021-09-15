import { Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { Character } from './character/character';
import { Dungeon } from './dungeon/dungeon';
import { DungeonRooms } from './dungeon/dungeonRoom';
import { LoadFight } from './fight/loadFight';
import { RoomNames } from './rooms/rooms';
import { CustomBattleUI } from './ui/customBattleUI';

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
        objects: [{ asset: 'chest', items: { items: ['SuperGloves', 'BasicSword'], size: 12 }, position: new Vector3(-2, 0, 0), rotation: new Vector3(0, degToRad(-90)) }],
        name: 'test'
      },
      awd2: {
        objects: [],
        name: 'test3',
        doors: {
          south: { type: 'room', roomId: 'awd', asset: 'basic' }
        }
      },
      awd3: {
        doors: { east: { roomId: 'awd', type: 'room', asset: 'basic' } },
        name: 'basic',
        fight: { class: 'awd', items: { gloves: 'BasicGloves', weapon: 'BasicSword' } },
        objects: []
      }
    }

    new Dungeon(rooms, 'awd', 'north')

    // if (this.startInFight) {
    // this.goToFight()
    // } else {
    // this.goToMainMenu()
    // }
  }
  goToMainMenu() {
    CustomBattleUI(this.goToFight.bind(this))
  }

  async goToFight(humanPlayer?: Player, player1?: Character, player2?: Character, stage?: RoomNames) {
    await LoadFight(humanPlayer || 'player1', this, player1 || { class: 'base', items: {} }, player2 || { class: 'base', items: {} }, stage || 'test');
  }

}

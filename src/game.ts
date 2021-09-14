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
          north: { type: 'room', roomId: 'awd2' },
          south: { type: 'exit' },
          west: { type: 'room', roomId: 'awd3' }
        },
        objects: [{ asset: 'chest', items: ['BasicGloves'], position: new Vector3(-2, 0, 0), rotation: new Vector3(0, degToRad(-90)) }],
        name: 'test'
      },
      awd2: {
        objects: [],
        name: 'test3',
        doors: {
          south: { type: 'room', roomId: 'awd' }
        }
      },
      awd3: {
        doors: { east: { roomId: 'awd', type: 'room' } },
        name: 'basic',
        fight: { class: 'awd', items: { gloves: 'BasicGloves' } },
        objects: []
      }
    }

    new Dungeon(rooms, 'awd')

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

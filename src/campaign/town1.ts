import { Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { createCharacter } from '../character/character';
import { DungeonInfo } from '../dungeon/dungeon';
import { Town } from './campaign';

const banditCamp: DungeonInfo<'Entry' | 'Room 1' | 'Room 2' | 'Room 3'> = {
  entryDir: 'north',
  firstRoom: 'Entry',
  rooms: {
    Entry: {
      doors: {
        north: { type: 'room', roomId: 'Room 1', asset: 'basic' },
        south: { type: 'exit', asset: 'basic' }
      },
      name: 'basic',
      objectInfos: []
    },
    'Room 1': {
      doors: { south: { type: 'room', asset: 'basic', roomId: 'Entry' }, north: { asset: 'basic', roomId: 'Room 2', type: 'room' } },
      name: 'basic', objectInfos: [],
      fight: { char: createCharacter({ money: 100, items: { gloves: 'BasicGloves' } }) }
    },
    'Room 2': {
      doors: { south: { type: 'room', asset: 'basic', roomId: 'Room 1' }, north: { asset: 'basic', roomId: 'Room 3', type: 'room' } },
      name: 'basic', objectInfos: [],
      fight: { char: createCharacter({ items: { weapon: 'BasicSword', gloves: 'BasicGloves' }, money: 200 }) }
    },
    'Room 3': {
      doors: { south: { type: 'room', asset: 'basic', roomId: 'Room 2' } },
      name: 'basic', objectInfos: [],
      fight: { char: createCharacter({ items: { gloves: 'BasicGloves' }, money: 500, class: 'awd2', skills: { Evasion: true } }), loot: { items: ['BanditBounty'] } }
    }
  }
}
const d2: DungeonInfo<'Entry' | 'Room North' | 'Room1' | 'Room2' | 'Room3'> = {
  entryDir: 'north',
  firstRoom: 'Entry',
  cost: 1000,
  rooms: {
    Entry: {
      doors: {
        north: { type: 'room', roomId: 'Room North', asset: 'basic' },
        south: { type: 'exit', asset: 'basic' },
        west: { type: 'room', roomId: 'Room1', asset: 'basic' }
      },
      objectInfos: [{ asset: 'chest', items: { items: ['Bandage', 'Bandage'], size: 12 }, position: new Vector3(-2, 0, 0), rotation: new Vector3(0, degToRad(-90)) }],
      name: 'test'
    },
    'Room North': {
      objectInfos: [],
      name: 'test3',
      doors: {
        south: { type: 'room', roomId: 'Entry', asset: 'basic' }
      }
    },
    Room1: {
      doors: { east: { roomId: 'Entry', type: 'room', asset: 'basic' }, west: { roomId: 'Room2', type: 'room', asset: 'basic' } },
      name: 'basic',
      fight: { char: createCharacter({ items: { gloves: 'SuperGloves' }, money: 500, class: 'awd2' }) },
      objectInfos: []
    },
    Room2: {
      doors: { east: { roomId: 'Room1', type: 'room', asset: 'basic', }, west: { roomId: 'Room3', type: 'room', asset: 'basic' } },
      name: 'test',
      objectInfos: [],
      fight: { char: createCharacter({ items: { gloves: 'SuperGloves', weapon: 'SuperSword', armor: 'BasicArmor' }, class: 'awd3', money: 750 }) }
    },
    Room3: {
      doors: { east: { roomId: 'Room2', type: 'room', asset: 'basic' }, },
      name: 'test',
      objectInfos: [],
      fight: { char: createCharacter({ items: { gloves: 'SuperGloves', weapon: 'SuperSword', armor: 'BasicArmor' }, money: 1000, class: 'awd3', skills: { "Strength II": true, Evasion: true, "Evasion II": true } }) }
    }
  }
}

export type Town1Dungeons = 'Bandit Camp' | 'Ruins';


export const town1: Town<Town1Dungeons> = {
  isUnlocked: true,
  travelCost: 0,
  shops: [
    {
      inventory: { items: ['Bandage', 'Bandage', 'Bandage'], size: 20 },
      name: 'Blacksmith',
      money: 4000,
      prices: { BasicGloves: { buy: 800, sell: 400 }, BasicSword: { buy: 1000, sell: 500 }, BasicArmor: { buy: 1000, sell: 500 }, Bandage: { buy: 50, sell: 10 } }
    }
  ],
  dungeons: {
    'Bandit Camp': banditCamp,
    Ruins: d2
  }
}
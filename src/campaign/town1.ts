import { Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { DungeonInfo } from '../dungeon/dungeon';
import { Town } from './campaign';

const banditCamp: DungeonInfo<'Entry' | 'Room 1'> = {
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
      doors: { south: { type: 'room', asset: 'basic', roomId: 'Entry' } },
      name: 'basic', objectInfos: [],
      fight: { char: { class: 'base', items: { gloves: 'BasicGloves', weapon: 'BasicSword' }, money: 500 } }
    }
  }
}
const d2: DungeonInfo<'Entry' | 'Room North' | 'Room1' | 'Room2' | 'Room3'> = {
  entryDir: 'north',
  firstRoom: 'Entry',
  cost: 5000,
  rooms: {
    Entry: {
      doors: {
        north: { type: 'room', roomId: 'Room North', asset: 'basic' },
        south: { type: 'exit', asset: 'basic' },
        west: { type: 'room', roomId: 'Room1', asset: 'basic' }
      },
      objectInfos: [{ asset: 'chest', items: { items: ['BasicGloves', 'BasicGloves'], size: 12 }, position: new Vector3(-2, 0, 0), rotation: new Vector3(0, degToRad(-90)) }],
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
      fight: { char: { class: 'base', items: { weapon: 'SuperSword', gloves: 'BasicGloves', armor: 'BasicArmor' }, money: 0 } },
      objectInfos: []
    },
    Room2: {
      doors: { east: { roomId: 'Room1', type: 'room', asset: 'basic', }, west: { roomId: 'Room3', type: 'room', asset: 'basic' } },
      name: 'test',
      objectInfos: [],
      fight: { char: { class: 'awd2', items: { armor: 'BasicArmor' }, money: 0 }, loot: { items: ['SuperGloves'] } }
    },
    Room3: {
      doors: { east: { roomId: 'Room2', type: 'room', asset: 'basic' }, },
      name: 'test',
      objectInfos: [],
      fight: { char: { class: 'awd3', items: { weapon: 'SuperSword', gloves: 'SuperGloves' }, money: 0 }, loot: { items: [] } }
    }
  }
}

export type Town1Dungeons = 'Bandit Camp' | 'd2';


export const town1: Town<Town1Dungeons> = {
  isUnlocked: true,
  travelCost: 200,
  shops: [
    {
      inventory: { items: ['BasicGloves', 'BasicGloves', 'BasicSword', 'BasicArmor', 'BanditBounty'], size: 20 },
      name: 'Blacksmith',
      money: 1000,
      prices: { BasicGloves: { buy: 800, sell: 400 }, BasicSword: { buy: 1000, sell: 500 }, BasicArmor: { buy: 1000, sell: 500 }, BanditBounty: { buy: 0, sell: 0 } }
    }
  ],
  dungeons: {
    'Bandit Camp': banditCamp,
    d2
  }
}
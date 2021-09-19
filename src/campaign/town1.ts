import { DungeonInfo } from '../dungeon/dungeon';
import { Town } from './campaign';

type Town1Dungeons = 'd1' | 'd2';

const d1: DungeonInfo<'Entry' | 'Room 1'> = {
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
      fight: { char: { class: 'base', items: { gloves: 'BasicGloves', weapon: 'BasicSword' }, money: 100 } }
    }
  }
}

const d2: DungeonInfo<'Entry' | 'Room 1'> = {
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
      fight: { char: { class: 'awd3', items: { gloves: 'BasicGloves' }, money: 1000 } }
    }
  }
}
export const town1: Town<Town1Dungeons> = {
  shops: [
    {
      inventory: { items: ['BasicGloves', 'BasicGloves', 'BasicSword'], size: 20 },
      name: 'Blacksmith',
      money: 1000,
      prices: { BasicGloves: { buy: 200, sell: 100 }, BasicSword: { buy: 1000, sell: 500 } }
    }
  ],
  dungeons: {
    d1,
    d2
  }
}
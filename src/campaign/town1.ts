import { DungeonInfo } from '../dungeon/dungeon';
import { Town } from './campaign';

type Town1Dungeons = 'd1' | 'd2';

const d1: DungeonInfo<'Room1' | 'room2'> = {
  entryDir: 'north',
  firstRoom: 'Room1',
  rooms: {
    Room1: { doors: {}, name: 'basic', objectInfos: [] },
    room2: { doors: {}, name: 'basic', objectInfos: [] }
  }
}

const d2: DungeonInfo<'Room1' | 'room2'> = {
  entryDir: 'north',
  firstRoom: 'Room1',
  rooms: {
    Room1: { doors: {}, name: 'basic', objectInfos: [] },
    room2: { doors: {}, name: 'basic', objectInfos: [] }
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
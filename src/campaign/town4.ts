import { DungeonInfo } from '../dungeon/dungeon';
import { Town } from './campaign';

const d1: DungeonInfo<'Room1'> = {
  entryDir: 'north',
  firstRoom: 'Room1',
  rooms: {
    Room1: { doors: { south: { type: 'exit', asset: 'basic' } }, name: 'basic', objectInfos: [] },
  }
}

export type Town4Dungeons = 'awd1';

export const town4: Town<Town4Dungeons> = {
  isUnlocked: false,
  travelCost: 10000,
  shops: [],
  dungeons: {
    awd1: d1,
  }
}
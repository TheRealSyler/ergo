import { DungeonInfo } from '../dungeon/dungeon';
import { Town } from './campaign';



const d1: DungeonInfo<'Room1'> = {
  entryDir: 'north',
  firstRoom: 'Room1',
  rooms: {
    Room1: { doors: { south: { type: 'exit', asset: 'basic' } }, name: 'basic', objectInfos: [] },
  }
}


export type Town2Dungeons = 'awd1';

export const town2: Town<Town2Dungeons> = {
  isUnlocked: true,
  travelCost: 500,
  hasBeenVisited: false,
  shops: [],
  dungeons: {
    awd1: d1,
  }
}
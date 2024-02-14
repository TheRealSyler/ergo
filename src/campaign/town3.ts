import { DungeonInfo } from '../dungeon/dungeon';
import { Town } from './campaign';

const d1: DungeonInfo<'Room1'> = {
  entryDir: 'north',
  firstRoom: 'Room1',
  rooms: {
    Room1: { doors: { south: { type: 'exit', asset: 'basic' } }, name: 'basic', objectInfos: [] },
  }
}

export type Town3Dungeons = 'awd1'

export const town3: Town<Town3Dungeons> = {
  isUnlocked: false,
  travelCost: 0,
  hasBeenVisited: false,
  shops: [],
  dungeons: {
    awd1: d1,

  }
}
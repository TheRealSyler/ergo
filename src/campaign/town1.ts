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
  dungeons: {
    d1,
    d2
  }
}
import { Character } from '../character/character';
import { ItemName } from '../character/items';
import { RoomNames } from '../rooms/rooms';
import { Position3 } from '../utils';
import { DungeonDirections } from './dungeon';
import { RoomItemNames } from './dungeonRoomItem';

type DungeonDoor<Rooms extends string> = { type: 'exit'; } | { type: 'room'; roomId: Rooms; };



export interface RoomItemInfo {
  asset: RoomItemNames,
  items?: ItemName[]
  position?: Position3
  rotation?: Position3
}

export interface DungeonRoom<Rooms extends string> {
  doors: Partial<Record<DungeonDirections, DungeonDoor<Rooms>>>;
  fight?: Character;
  objects: RoomItemInfo[],
  name: RoomNames;
}

export type DungeonRooms<Rooms extends string> = Record<Rooms, DungeonRoom<Rooms>>

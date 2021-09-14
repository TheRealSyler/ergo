import { Character } from '../character/character';
import { ItemName } from '../character/items';
import { RoomNames } from '../rooms/rooms';
import { Position3 } from '../utils';
import { RoomItemNames } from './dungeonRoomItem';

type DungeonDoor<Rooms extends string> = { type: 'exit'; } | { type: 'room'; roomId: Rooms; };

export type DoorDir = 'north' | 'east' | 'west' | 'south';

export interface RoomItemInfo {
  asset: RoomItemNames,
  items?: ItemName[]
  position?: Position3
  rotation?: Position3
}

export interface DungeonRoom<Rooms extends string> {
  doors: Partial<Record<DoorDir, DungeonDoor<Rooms>>>;
  fight?: Character;
  objects: RoomItemInfo[],
  name: RoomNames;
}

export type DungeonRooms<Rooms extends string> = Record<Rooms, DungeonRoom<Rooms>>

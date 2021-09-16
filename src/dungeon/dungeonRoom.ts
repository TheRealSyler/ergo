import { Character } from '../character/character';
import { RoomNames } from '../rooms/rooms';
import { Inventory } from '../ui/inventoryUI';
import { Position3 } from '../utils';
import { RoomDoorName } from './doors';
import { DungeonDir } from './dungeon';
import { RoomItemNames } from './dungeonRoomItem';

export type DungeonDoor<Rooms extends string> = { type: 'exit'; asset: RoomDoorName } | { type: 'room'; roomId: Rooms; asset: RoomDoorName };

export interface RoomItemInfo {
  asset: RoomItemNames
  removeIfEmpty?: boolean
  items?: Inventory
  position?: Position3
  rotation?: Position3
}

export interface DungeonRoom<Rooms extends string> {
  doors: Partial<Record<DungeonDir, DungeonDoor<Rooms>>>;
  fight?: { char: Character, loot?: Inventory };
  objectInfos: RoomItemInfo[],
  name: RoomNames;
}

export type DungeonRooms<Rooms extends string> = Record<Rooms, DungeonRoom<Rooms>>

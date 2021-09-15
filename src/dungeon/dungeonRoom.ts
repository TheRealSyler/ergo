import { Character } from '../character/character';
import { ItemName } from '../character/items';
import { RoomNames } from '../rooms/rooms';
import { Inventory } from '../ui/inventoryUI';
import { Position3 } from '../utils';
import { RoomDoorName } from './doors';
import { DungeonDir } from './dungeon';
import { RoomItemNames } from './dungeonRoomItem';

export type DungeonDoor<Rooms extends string> = { type: 'exit'; asset: RoomDoorName } | { type: 'room'; roomId: Rooms; asset: RoomDoorName };

export interface RoomItemInfo {
  asset: RoomItemNames,
  items?: Inventory
  position?: Position3
  rotation?: Position3
}

export interface DungeonRoom<Rooms extends string> {
  doors: Partial<Record<DungeonDir, DungeonDoor<Rooms>>>;
  fight?: Character;
  objects: RoomItemInfo[],
  name: RoomNames;
}

export type DungeonRooms<Rooms extends string> = Record<Rooms, DungeonRoom<Rooms>>

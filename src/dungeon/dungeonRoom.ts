import type { Character } from '../character/character'
import type { RoomNames } from '../rooms/rooms'
import type { Inventory } from '../ui/inventoryUI'
import type { Position3 } from '../utils'
import type { RoomDoorName } from './doors'
import type { DungeonDir } from './dungeon'
import type { RoomItemNames } from './dungeonRoomItem'

export type DungeonDoor<Rooms extends string> = { type: 'exit' | 'exit-completed'; asset: RoomDoorName } | { type: 'room'; roomId: Rooms; asset: RoomDoorName };

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

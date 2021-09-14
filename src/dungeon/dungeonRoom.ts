import { ObstacleName } from '../rooms/roomObstacles';
import { RoomNames } from '../rooms/rooms';

type DungeonDoor = { type: 'exit'; } | { type: 'room'; room: DungeonRoom; };
export type DoorDir = 'north' | 'east' | 'west' | 'south';

export class DungeonRoom {
  doors: Partial<Record<DoorDir, DungeonDoor>> = {};
  obstacles: ObstacleName[] = []
  static count = 0 // TODO remove count
  _count: number;
  constructor(public name: RoomNames) {

    this._count = DungeonRoom.count
    DungeonRoom.count++
  }

  addDoor(dir: DoorDir, room?: DungeonRoom) {
    if (room) {
      this.doors[dir] = {
        room,
        type: 'room'
      };
      return;
    }
    this.doors[dir] = { type: 'exit' };
  }
}

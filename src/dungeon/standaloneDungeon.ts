import { Character } from '../character/character';
import { CharacterStats, createStats } from '../character/stats';
import { Renderer } from '../renderer';
import { Inventory } from '../ui/inventoryUI';
import { Dungeon, DungeonInfo, DungeonParent } from './dungeon';

export default class StandaloneDungeon<R extends string> extends Renderer implements DungeonParent {
  private dungeon: Dungeon<R>;

  character: Character = {
    class: 'base',
    items: {},
    money: 1000
  }

  stats: CharacterStats = createStats(this.character)

  inventory: Inventory = {
    items: [],
    size: 12
  };

  constructor(dungeonInfo: DungeonInfo<R>) {
    super(0.01)
    this.dungeon = new Dungeon(dungeonInfo, this, () => this.updateRenderer(0))
  }
  update(delta: number) {
    this.dungeon.update((delta - this.previousRAF) * 0.001)
  }
  exit() {
    this.dungeon.exit()
    this.disposeRenderer();
  }
}
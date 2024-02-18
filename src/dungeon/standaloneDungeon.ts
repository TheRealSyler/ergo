import { createCharacter, type Character } from '../character/character'
import { createStats, type CharacterStats } from '../character/stats'
import { Game } from '../game'
import { Renderer } from '../renderer'
import { InventoryUI, type Inventory } from '../ui/inventoryUI'
import { Dungeon, type DungeonInfo, type DungeonParent } from './dungeon'

export default class StandaloneDungeon<R extends string> extends Renderer implements DungeonParent {
  private dungeon: Dungeon<R>

  character: Character = createCharacter()

  stats: CharacterStats = createStats(this.character)

  inventory: Inventory = {
    items: [],
    size: 12
  }

  inventoryUI = new InventoryUI(this.inventory, this.character, this.stats)

  constructor(private game: Game, dungeonInfo: DungeonInfo<R>) {
    super(0.01)
    this.dungeon = new Dungeon(dungeonInfo, this, () => this.updateRenderer(0), () => this.exit(), () => game.goToMainMenu())
  }
  update(delta: number) {
    this.dungeon.update((delta - this.previousRAF) * 0.001)
  }
  private exit() {
    this.disposeRenderer()
    this.game.goToMainMenu()
  }
}
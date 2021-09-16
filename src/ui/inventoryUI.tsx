import { h } from 'dom-chef'
import { MAIN_UI_ELEMENT } from './ui'

import './inventoryUI.sass'
import { ItemName, ITEMS } from '../character/items'
import { Character } from '../character/character'
import { getKeybinding } from '../keybindings'
import { CharacterStats, updateStatsWithItem } from '../character/stats'
import { toFixedIfNotZero } from '../utils'
import { BarComponent } from './barComponent'

export interface Inventory {
  items: (ItemName | undefined)[],
  size?: number;
}

type DragInfoInventoryAndLoot = 'inventory' | 'loot'

type DragInfo = {
  id: number
  type: DragInfoInventoryAndLoot
} | {
  id: keyof Character['items']
  type: 'character'
}

export class InventoryUI {
  private oneTimeListener?: () => void
  private mousePos = { x: 0, y: 0 }
  private offset = { x: 0, y: 0 }
  private dragInfo?: DragInfo = undefined
  private inventoryItemId = 'inventory-slot-'
  private characterItemId = 'inventory-character-slot-'
  private lootItemId = 'inventory-loot-slot-'

  private dragAndDropIcon = <div className="inventory-slot inventory-drag inventory-drag-el"></div>
  private lootItemsEl = <div className="inventory-items"></div>
  private lootName = <span className="inventory-title">Loot</span>
  private statsEl = <div className="inventory-stats"></div>
  private healthBar = new BarComponent('health')
  private staminaBar = new BarComponent('stamina')
  private lootEl = <div className="inventory-section">
    {this.lootName}
    {this.lootItemsEl}
  </div>

  private mainEl = <div className="inventory modal">
    <div className="inventory-content">

      <div className="inventory-section">
        <span className="inventory-title">Character</span>
        <div className="inventory-stats">
          <div className="inventory-bars">{this.healthBar.getEl()} {this.staminaBar.getEl()}</div>

        </div>
        {this.statsEl}
        <div className="inventory-char">
          {this.addItemSlot({ type: 'character', id: 'gloves' })}
          {this.addItemSlot({ type: 'character', id: 'weapon' })}
        </div>
      </div>

      <div className="inventory-section">
        <span className="inventory-title">Inventory</span>
        <div className="inventory-items">{this.addItemSlots(this.inventory)}</div>
      </div>

      {this.lootEl}

    </div>

    <div className="inventory-info-bar"> [{getKeybinding('Dungeon', 'ToggleInventory')}] Close </div>
  </div>
  private lootInventory: Inventory = { items: [], size: 0 }
  constructor(private inventory: Inventory, private character: Character, private stats: CharacterStats) {
    this.lootName.style.whiteSpace = 'nowrap'
  }

  visible = false

  show(loot?: { name: string, inventory: Inventory }, oneTimeListener?: () => void) {
    this.visible = true
    this.oneTimeListener = oneTimeListener
    window.addEventListener('mousemove', this.mousemove)
    window.addEventListener('mouseup', this.mouseup)
    MAIN_UI_ELEMENT.appendChild(this.mainEl)
    this.lootItemsEl.textContent = ''
    this.lootEl.style.display = 'none'
    if (loot) {
      this.lootName.textContent = `Loot (${loot.name})`

      this.lootEl.style.display = 'block'
      this.lootInventory = loot.inventory;
      this.lootItemsEl.append(...this.addItemSlots(this.lootInventory, 'loot'))
    }
    this.updateStats()
  }

  private updateStats() {
    this.statsEl.textContent = ''

    this.healthBar.set(this.stats.health, this.stats.maxHealth)
    this.staminaBar.set(this.stats.stamina, this.stats.maxStamina)

    for (const key in this.stats) {
      if (Object.prototype.hasOwnProperty.call(this.stats, key)) {
        const stat = this.stats[key as keyof CharacterStats]
        switch (key as keyof CharacterStats) {
          case 'aiDodgeReactionTime':
          case 'aiTimeToAttack':
          case 'health':
          case 'stamina':
          case 'maxHealth':
          case 'maxStamina':
            break
          default:
            this.statsEl.appendChild(<span className="inventory-stat">
              <span>{key}:</span> <span>{this.displayStat(stat)}</span>
            </span>)
            break
        }
      }
    }
  }

  hide() {
    this.visible = false
    this.mainEl.remove()
    window.removeEventListener('mousemove', this.mousemove)
    window.removeEventListener('mouseup', this.mouseup)
    if (this.oneTimeListener) {
      this.oneTimeListener()
      this.oneTimeListener = undefined
    }
  }

  private displayStat(stat: CharacterStats[keyof CharacterStats]) {
    switch (typeof stat) {
      case 'number':
        return toFixedIfNotZero(stat, 1)
      case 'object':
        return `${toFixedIfNotZero(stat.min, 1)} - ${toFixedIfNotZero(stat.max, 1)}`
    }
  }

  private addItemSlots(inventory: Inventory, type: DragInfoInventoryAndLoot = 'inventory') {
    const items = []
    const size = inventory.size || inventory.items.length
    for (let i = 0; i < size; i++) {
      items.push(this.addItemSlot({ type, id: i }))
    }
    return items
  }

  private addItemSlot(info: DragInfo): HTMLElement {
    const slotID = this.getSlotIdType(info)
    return <div id={`${slotID}${info.id}`} className={inventorySlotClassList(!this.getItem(info))} onMouseDown={(e) => {
      if (this.getItem(info)) {
        this.dragAndDropIcon.textContent = this.getItem(info) || this.getEmptySlotName(info)
        this.dragInfo = info
        MAIN_UI_ELEMENT.appendChild(this.dragAndDropIcon)
        const bounds = this.dragAndDropIcon.getBoundingClientRect()
        this.offset.x = -(bounds.width / 2)
        this.offset.y = -(bounds.height / 2)
        this.dragAndDropIcon.style.transform = `translate(${this.mousePos.x + this.offset.x}px, ${this.mousePos.y + this.offset.y}px)`

        const selfEl = document.getElementById(`${slotID}${info.id}`)!
        selfEl.classList.add('inventory-is-dragging')

      }
    }}>{this.getItem(info) || this.getEmptySlotName(info)}</div>
  }

  private getSlotIdType(info: DragInfo) {
    switch (info.type) {
      case 'character':
        return this.characterItemId
      case 'inventory':
        return this.inventoryItemId
      case 'loot':
        return this.lootItemId
    }
  }

  private getItem(info: DragInfo) {
    switch (info.type) {
      case 'loot':
        return this.lootInventory.items[info.id]
      case 'inventory':
        return this.inventory.items[info.id]
      case 'character':
        return this.character.items[info.id]
    }
  }
  private setItem(info: DragInfo, item?: ItemName,) {
    switch (info.type) {
      case 'loot':
        return this.lootInventory.items[info.id] = item
      case 'inventory':
        return this.inventory.items[info.id] = item
      case 'character':
        //@ts-ignore
        return this.character.items[info.id] = item
    }
  }

  private getEmptySlotName(info: DragInfo) {
    switch (info.type) {
      case 'inventory':
      case 'loot':
        return 'EMPTY'
      case 'character':
        return info.id.toUpperCase()
    }
  }

  private mousemove = (e: MouseEvent) => {
    this.mousePos.x = e.pageX
    this.mousePos.y = e.pageY
    if (this.dragInfo) {
      this.dragAndDropIcon.style.transform = `translate(${this.mousePos.x + this.offset.x}px, ${this.mousePos.y + this.offset.y}px)`
    }
  }
  private mouseup = (e: MouseEvent) => {
    if (this.dragInfo) {
      const target = e.target as any as HTMLElement

      if (target.id.startsWith(this.inventoryItemId)) {
        this.dropItem(target, this.dragInfo, { id: parseInt(target.id.replace(this.inventoryItemId, '')), type: 'inventory' })
      } else if (target.id.startsWith(this.lootItemId)) {
        this.dropItem(target, this.dragInfo, { id: parseInt(target.id.replace(this.lootItemId, '')), type: 'loot' })

      } else if (target.id.startsWith(this.characterItemId)) {
        const droppedItem = this.getItem(this.dragInfo)
        const id = target.id.replace(this.characterItemId, '') as keyof Character['items']
        if (ITEMS[id][droppedItem as keyof Character['items']['gloves']] !== undefined) {
          this.dropItem(target, this.dragInfo, { id: id, type: 'character' })
        } else {
          this.cancelDrop(this.dragInfo)
        }
      } else {
        this.cancelDrop(this.dragInfo)
      }
      this.dragAndDropIcon.remove()
      this.dragInfo = undefined
    }
  }

  private cancelDrop(dragInfo: Required<DragInfo>) {
    const oldEl = document.getElementById(`${this.getSlotIdType(dragInfo)}${dragInfo.id}`)!
    oldEl.classList.remove('inventory-is-dragging')
  }

  private dropItem(target: HTMLElement, dragInfo: Required<DragInfo>, targetInfo: Required<DragInfo>) {
    const droppedItemName = this.getItem(dragInfo)
    const oldItemName = this.getItem(targetInfo)

    target.textContent = droppedItemName || this.getEmptySlotName(targetInfo)
    target.className = inventorySlotClassList(!droppedItemName)

    const oldEl = document.getElementById(`${this.getSlotIdType(dragInfo)}${dragInfo.id}`)!
    oldEl.className = inventorySlotClassList(!oldItemName)
    oldEl.textContent = oldItemName || this.getEmptySlotName(dragInfo)
    if (droppedItemName === oldItemName) return;

    this.setItem(dragInfo, oldItemName)
    this.setItem(targetInfo, droppedItemName)

    const droppedItemDrag = this.getItemStatChanges(dragInfo, droppedItemName)
    const droppedItemTarget = this.getItemStatChanges(targetInfo, droppedItemName)
    if (droppedItemDrag) {
      updateStatsWithItem(this.stats, droppedItemDrag, false)
    }
    if (droppedItemTarget) {
      updateStatsWithItem(this.stats, droppedItemTarget, true)
    }
    let oldItemDrag = this.getItemStatChanges(dragInfo, oldItemName)
    let oldItemTarget = this.getItemStatChanges(targetInfo, oldItemName)
    if (oldItemDrag) {
      updateStatsWithItem(this.stats, oldItemDrag, true)
    }
    if (oldItemTarget) {
      updateStatsWithItem(this.stats, oldItemTarget, false)
    }
    this.updateStats()
  }

  private getItemStatChanges(dragInfo: Required<DragInfo>, itemName?: string,) {
    return itemName && dragInfo.type === 'character' ? ITEMS[dragInfo.id][itemName as keyof Character['items']['gloves']] : undefined
  }
}

function inventorySlotClassList(isEmpty: boolean) {
  return isEmpty ? 'inventory-slot' : 'inventory-slot inventory-drag'
}
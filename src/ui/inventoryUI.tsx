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

type SlotTypeInventoryOrLoot = 'inventory' | 'loot'

type SlotInfo = {
  id: number
  type: SlotTypeInventoryOrLoot
} | {
  id: keyof Character['items']
  type: 'character'
}

export class InventoryUI {
  private oneTimeListener?: () => void
  private mousePos = { x: 0, y: 0 }
  private offset = { x: 0, y: 0 }
  private draggedSlotInfo?: SlotInfo = undefined
  private inventoryItemId = 'inventory-slot-'
  private characterItemId = 'inventory-character-slot-'
  private lootItemId = 'inventory-loot-slot-'

  private dragAndDropIcon = <div className="inventory-slot inventory-drag inventory-drag-el"></div>
  private lootItemsEl = <div className="inventory-items"></div>
  private lootName = <span className="inventory-title">Loot</span>
  private lootNameInfo = <span>Loot Name</span>
  private lootInfo = <span>| [ALT + MOUSE CLICK] Move to {this.lootNameInfo}</span>

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

    <div className="inventory-info-bar"> [{getKeybinding('Dungeon', 'ToggleInventory')}] Close | [CTRL + MOUSE CLICK] Equip | [SHIFT + MOUSE CLICK] Move to Inventory {this.lootInfo} </div>
  </div>
  private lootInventory?: Inventory;
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
    if (loot) {
      this.lootName.textContent = `${loot.name}`
      this.lootNameInfo.textContent = loot.name
      this.lootInfo.style.display = 'inline'
      this.lootEl.style.display = 'inherit'
      this.lootInventory = loot.inventory;
      this.lootItemsEl.append(...this.addItemSlots(this.lootInventory, 'loot'))
    } else {
      this.lootEl.style.display = 'none'
      this.lootInfo.style.display = 'none'
      this.lootInventory = undefined
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
            // TODO add icons.
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

  private addItemSlots(inventory: Inventory, type: SlotTypeInventoryOrLoot = 'inventory') {
    const items = []
    const size = inventory.size || inventory.items.length
    for (let i = 0; i < size; i++) {
      items.push(this.addItemSlot({ type, id: i }))
    }
    return items
  }

  private addItemSlot(slotInfo: SlotInfo): HTMLElement {
    const slotID = this.getSlotIdType(slotInfo)
    return <div id={`${slotID}${slotInfo.id}`} className={inventorySlotClassList(!this.getItem(slotInfo))} onMouseDown={(e) => {
      const item = this.getItem(slotInfo)
      if (item) {
        if (e.ctrlKey) { // TODO add ability to add keybindings if necessary with a keydown/up listener.
          if (this.equipItem(slotInfo, item)) return;
        } else if (e.shiftKey) {
          if (this.moveItemToInventory(slotInfo)) return;
        } else if (e.altKey) {
          e.preventDefault()
          if (this.moveItemToLoot(slotInfo)) return;
        }

        this.dragAndDropIcon.textContent = item || this.getEmptySlotName(slotInfo)
        this.draggedSlotInfo = slotInfo
        MAIN_UI_ELEMENT.appendChild(this.dragAndDropIcon)
        const bounds = this.dragAndDropIcon.getBoundingClientRect()
        this.offset.x = -(bounds.width / 2)
        this.offset.y = -(bounds.height / 2)
        this.dragAndDropIcon.style.transform = `translate(${this.mousePos.x + this.offset.x}px, ${this.mousePos.y + this.offset.y}px)`

        const selfEl = document.getElementById(`${slotID}${slotInfo.id}`)!
        selfEl.classList.add('inventory-is-dragging')

      }
    }}>{this.getItem(slotInfo) || this.getEmptySlotName(slotInfo)}</div>
  }

  private equipItem(slot: SlotInfo, item: ItemName) {
    switch (slot.type) {
      case 'character':
        const size = this.inventory.size || this.inventory.items.length
        for (let i = 0; i < size; i++) {
          if (!this.inventory.items[i]) {
            const target = document.getElementById(`${this.inventoryItemId}${i}`)
            target && this.dropItem(target, slot, { type: 'inventory', id: i })
            return true;
          }
        }
        break;
      case 'inventory':
      case 'loot':
        for (const key in ITEMS) {
          if (Object.prototype.hasOwnProperty.call(ITEMS, key)) {
            if (ITEMS[key as keyof typeof ITEMS][item as keyof Character['items']['gloves']]) {
              const target = document.getElementById(`${this.characterItemId}${key}`)
              target && this.dropItem(target, slot, { type: 'character', id: key as any })
              return true;
            }
          }
        }
        break;
    }
  }
  private moveItemToInventory(slot: SlotInfo) {
    switch (slot.type) {
      case 'character':
      case 'loot':
        const size = this.inventory.size || this.inventory.items.length
        for (let i = 0; i < size; i++) {
          // console.log('INVENTORY', this.inventory.items[i])
          if (!this.inventory.items[i]) {
            const target = document.getElementById(`${this.inventoryItemId}${i}`)
            // console.log('INVENTORY TARGET', target)
            target && this.dropItem(target, slot, { type: 'inventory', id: i })
            return true;
          }
        }
        break;
    }
  }
  private moveItemToLoot(slot: SlotInfo) {
    if (this.lootInventory) {
      switch (slot.type) {
        case 'inventory':
        case 'character':
          const size = this.lootInventory.size || this.lootInventory.items.length
          for (let i = 0; i < size; i++) {
            if (!this.lootInventory.items[i]) {
              const target = document.getElementById(`${this.lootItemId}${i}`)
              target && this.dropItem(target, slot, { type: 'loot', id: i })
              return true;
            }
          }
          break;
      }
    }
  }

  private getSlotIdType(slot: SlotInfo) {
    switch (slot.type) {
      case 'character':
        return this.characterItemId
      case 'inventory':
        return this.inventoryItemId
      case 'loot':
        return this.lootItemId
    }
  }

  private getItem(slot: SlotInfo) {
    switch (slot.type) {
      case 'loot':
        return this.lootInventory?.items[slot.id]
      case 'inventory':
        return this.inventory.items[slot.id]
      case 'character':
        return this.character.items[slot.id]
    }
  }
  private setItem(slot: SlotInfo, item?: ItemName) {
    switch (slot.type) {
      case 'loot':
        if (this.lootInventory) {
          this.lootInventory.items[slot.id] = item
        }
        break;
      case 'inventory':
        this.inventory.items[slot.id] = item
        break;
      case 'character':
        //@ts-ignore
        this.character.items[slot.id] = item
        break;
    }
  }

  private getEmptySlotName(slot: SlotInfo) {
    switch (slot.type) {
      case 'inventory':
      case 'loot':
        return 'EMPTY'
      case 'character':
        return slot.id.toUpperCase()
    }
  }

  private mousemove = (e: MouseEvent) => {
    this.mousePos.x = e.pageX
    this.mousePos.y = e.pageY
    if (this.draggedSlotInfo) {
      this.dragAndDropIcon.style.transform = `translate(${this.mousePos.x + this.offset.x}px, ${this.mousePos.y + this.offset.y}px)`
    }
  }
  private mouseup = (e: MouseEvent) => {
    if (this.draggedSlotInfo) {
      const target = e.target as any as HTMLElement

      if (target.id.startsWith(this.inventoryItemId)) {
        this.dropItem(target, this.draggedSlotInfo, { id: parseInt(target.id.replace(this.inventoryItemId, '')), type: 'inventory' })
      } else if (target.id.startsWith(this.lootItemId)) {
        this.dropItem(target, this.draggedSlotInfo, { id: parseInt(target.id.replace(this.lootItemId, '')), type: 'loot' })

      } else if (target.id.startsWith(this.characterItemId)) {
        const droppedItem = this.getItem(this.draggedSlotInfo)
        const id = target.id.replace(this.characterItemId, '') as keyof Character['items']
        if (ITEMS[id][droppedItem as keyof Character['items']['gloves']] !== undefined) {
          this.dropItem(target, this.draggedSlotInfo, { id: id, type: 'character' })
        } else {
          this.cancelDrop(this.draggedSlotInfo)
        }
      } else {
        this.cancelDrop(this.draggedSlotInfo)
      }
      this.dragAndDropIcon.remove()
      this.draggedSlotInfo = undefined
    }
  }

  private cancelDrop(slot: Required<SlotInfo>) {
    const oldEl = document.getElementById(`${this.getSlotIdType(slot)}${slot.id}`)!
    oldEl.classList.remove('inventory-is-dragging')
  }

  private dropItem(target: HTMLElement, draggedSlotInfo: Required<SlotInfo>, targetSlotInfo: Required<SlotInfo>) {
    const droppedItemName = this.getItem(draggedSlotInfo)
    const oldItemName = this.getItem(targetSlotInfo)

    target.textContent = droppedItemName || this.getEmptySlotName(targetSlotInfo)
    target.className = inventorySlotClassList(!droppedItemName)

    const oldEl = document.getElementById(`${this.getSlotIdType(draggedSlotInfo)}${draggedSlotInfo.id}`)!
    oldEl.className = inventorySlotClassList(!oldItemName)
    oldEl.textContent = oldItemName || this.getEmptySlotName(draggedSlotInfo)
    if (droppedItemName === oldItemName) return;

    this.setItem(draggedSlotInfo, oldItemName)
    this.setItem(targetSlotInfo, droppedItemName)

    const droppedItemDrag = this.getItemStatChanges(draggedSlotInfo, droppedItemName)
    const droppedItemTarget = this.getItemStatChanges(targetSlotInfo, droppedItemName)
    if (droppedItemDrag) {
      updateStatsWithItem(this.stats, droppedItemDrag, false)
    }
    if (droppedItemTarget) {
      updateStatsWithItem(this.stats, droppedItemTarget, true)
    }
    let oldItemDrag = this.getItemStatChanges(draggedSlotInfo, oldItemName)
    let oldItemTarget = this.getItemStatChanges(targetSlotInfo, oldItemName)
    if (oldItemDrag) {
      updateStatsWithItem(this.stats, oldItemDrag, true)
    }
    if (oldItemTarget) {
      updateStatsWithItem(this.stats, oldItemTarget, false)
    }
    this.updateStats()
  }

  private getItemStatChanges(slot: Required<SlotInfo>, itemName?: string,) {
    return itemName && slot.type === 'character' ? ITEMS[slot.id][itemName as keyof Character['items']['gloves']] : undefined
  }
}

function inventorySlotClassList(isEmpty: boolean) {
  return isEmpty ? 'inventory-slot' : 'inventory-slot inventory-drag'
}
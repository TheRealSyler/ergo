import { h } from 'dom-chef'
import { MAIN_UI_ELEMENT } from './ui'

import './inventoryUI.sass'
import { ItemName, ITEMS } from '../character/items'
import { Character } from '../character/character'
import { getKeybinding } from '../keybindings'

export interface Inventory {
  items: (ItemName | undefined)[],
  size: number;
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
  private mousePos = { x: 0, y: 0 }
  private offset = { x: 0, y: 0 }
  private dragInfo?: DragInfo = undefined
  private inventoryItemId = 'inventory-slot-'
  private characterItemId = 'inventory-character-slot-'
  private lootItemId = 'inventory-loot-slot-'

  private dragAndDropIcon = <div className="inventory-slot inventory-drag inventory-drag-el"></div>
  private lootItemsEl = <div className="inventory-items"></div>
  private lootName = <h1>Loot</h1>

  private lootEl = <div>
    {this.lootName}
    {this.lootItemsEl}
  </div>
  private mainEl = <div className="inventory">
    <div className="inventory-content">

      <div>
        <h1>Character</h1>
        <div className="inventory-char">
          {this.addItemSlot({ type: 'character', id: 'gloves' })}
          {this.addItemSlot({ type: 'character', id: 'weapon' })}
        </div>
      </div>

      <div>
        <h1>Inventory</h1>
        <div className="inventory-items">{this.addItemSlots(this.inventory)}</div>
      </div>

      {this.lootEl}

    </div>

    <div className="inventory-info-bar"> [{getKeybinding('Dungeon', 'ToggleInventory')}] Close Inventory </div>
  </div>
  private lootInventory: Inventory = { items: [], size: 0 }
  constructor(public inventory: Inventory, public character: Character) { }

  visible = false

  show(loot?: { name: string, inventory: Inventory }) {
    this.visible = true
    window.addEventListener('mousemove', this.mousemove)
    window.addEventListener('mouseup', this.mouseup)
    MAIN_UI_ELEMENT.appendChild(this.mainEl)
    this.lootItemsEl.textContent = ''
    this.lootEl.style.display = 'none'
    if (loot) {
      (this.lootName.textContent = `Loot (${loot.name})`)

      this.lootEl.style.display = 'block'
      this.lootInventory = loot.inventory;
      this.lootItemsEl.append(...this.addItemSlots(this.lootInventory, 'loot'))
    }

  }

  hide() {
    this.visible = false
    this.mainEl.remove()
    window.removeEventListener('mousemove', this.mousemove)
    window.removeEventListener('mouseup', this.mouseup)
  }


  private addItemSlots(inventory: Inventory, type: DragInfoInventoryAndLoot = 'inventory') {
    const items = []

    for (let i = 0; i < inventory.size; i++) {
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
    const droppedItem = this.getItem(dragInfo)
    target.textContent = droppedItem || this.getEmptySlotName(targetInfo)
    target.className = inventorySlotClassList(!droppedItem)
    const item = this.getItem(targetInfo)
    this.setItem(dragInfo, item)
    this.setItem(targetInfo, droppedItem)

    const oldEl = document.getElementById(`${this.getSlotIdType(dragInfo)}${dragInfo.id}`)!
    oldEl.className = inventorySlotClassList(!item)
    oldEl.textContent = item || this.getEmptySlotName(dragInfo)
  }
}

function inventorySlotClassList(isEmpty: boolean) {
  return isEmpty ? 'inventory-slot' : 'inventory-slot inventory-drag'
}
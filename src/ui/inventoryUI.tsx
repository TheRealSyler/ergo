import { h } from 'dom-chef'
import { MAIN_UI_ELEMENT } from './ui'

import './inventoryUI.sass'
import { ItemName, ITEMS, ItemWithStatChange, ITEM_TYPES } from '../character/items'
import { Character, expGainAtLevel, expToNextLevel } from '../character/character'
import { getKeybinding, getKeybindingUI } from '../keybindings'
import { CharacterStats, FLIPPED_STAT_SIGN, updateStatsWithItem, useConsumable } from '../character/stats'
import { toFixedIfNotZero } from '../utils'
import { BarComponent, BAR_COLORS } from './barComponent'
import { Shop } from '../campaign/campaign'
import { TooltipComponent } from './tooltipComponent'
import { ColorText, StatEl } from './components'

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
  private tooltip = new TooltipComponent()
  private inventoryItemId = 'inventory-slot-'
  private characterItemId = 'inventory-character-slot-'
  private lootItemId = 'inventory-loot-slot-'

  private dragAndDropSlot = <div className="inventory-slot inventory-drag inventory-drag-el"></div>
  private lootItemsEl = <div className="inventory-items"></div>
  private lootName = <span className="inventory-title">Loot</span>
  private shopMoneyEl = <div className="inventory-stats"></div>
  private lootNameInfo = <span>Loot Name</span>
  private lootInfo = <span>| [ALT + MOUSE CLICK] Move to {this.lootNameInfo}</span>

  private statsEl = <div className="inventory-stats"></div>
  private charMoneyEl = <div className="inventory-stats"></div> // TODO add tooltip on hover
  private charLevelEl = <div className="inventory-stats"></div> // TODO add tooltip on hover
  private healthBar = new BarComponent(BAR_COLORS.health)
  private staminaBar = new BarComponent(BAR_COLORS.stamina)
  private levelBar = new BarComponent(BAR_COLORS.level)
  private lootEl = <div className="inventory-section">
    {this.lootName}
    {this.shopMoneyEl}
    {this.lootItemsEl}
  </div>

  private readonly inventorySlotEl = <div className="inventory-items"></div>

  private readonly charSlots = <div className="inventory-char"></div>

  private mainEl = <div className={`inventory${this.isModal ? ' modal' : ''}`}>
    <div className="inventory-content">

      <div className="inventory-section">
        <span className="inventory-title">Character</span>
        {this.charMoneyEl}
        {this.charLevelEl}
        <div className="inventory-stats">
          <div className="inventory-bars">{this.healthBar.getEl()} {this.staminaBar.getEl()} {this.levelBar.getEl()}</div>

        </div>
        {this.statsEl}
        {this.charSlots}
      </div>

      <div className="inventory-section">
        <span className="inventory-title">Inventory</span>
        {this.inventorySlotEl}
      </div>

      {this.lootEl}

    </div>

    <div className="inventory-info-bar">
      {this.isModal && <span className="button" onClick={() => this.toggle()}>{getKeybindingUI('Inventory', 'ToggleInventory')} Close</span>}
      {this.isModal && '| '}
      [CTRL + MOUSE CLICK] Equip/Use |
      [SHIFT + MOUSE CLICK] Move to Inventory {this.lootInfo} </div>
  </div>
  private lootInventory?: Inventory;
  private shop?: Shop;
  constructor(private inventory: Inventory, private character: Character, private stats: CharacterStats, private isModal = true, private parentEl: HTMLElement = MAIN_UI_ELEMENT) {
    this.lootName.style.whiteSpace = 'nowrap'
    this.shopMoneyEl.style.display = 'none'
    this.createAllSlots()
  }

  visible = false
  toggle() {
    if (this.visible) {
      this.hide()
    } else {
      this.show()
    }
  }

  private createAllSlots() {
    this.charSlots.textContent = ''
    this.charSlots.appendChild(this.addItemSlot({ type: 'character', id: 'gloves' }))
    this.charSlots.appendChild(this.addItemSlot({ type: 'character', id: 'weapon' }))
    this.charSlots.appendChild(this.addItemSlot({ type: 'character', id: 'armor' }))
    this.inventorySlotEl.textContent = ''
    this.inventorySlotEl.append(...this.addItemSlots(this.inventory))
  }

  showShop(shop: Shop) {
    this.shop = shop
    this.shopMoneyEl.style.display = 'inherit'
    this.createAllSlots()
    this.show(shop)
  }

  show(lootOrShop?: { name: string, inventory: Inventory }, oneTimeListener?: () => void) {
    this.visible = true
    this.oneTimeListener = oneTimeListener
    window.addEventListener('mousemove', this.mousemove)
    window.addEventListener('mouseup', this.mouseup)
    window.addEventListener('keydown', this.keydown)
    this.parentEl.appendChild(this.mainEl)
    this.tooltip.removeClasses()
    this.parentEl.appendChild(this.tooltip.mainEl)
    this.lootItemsEl.textContent = ''
    if (lootOrShop) {
      this.lootName.textContent = `${lootOrShop.name}`
      this.lootNameInfo.textContent = lootOrShop.name
      this.lootInfo.style.display = 'inline'
      this.lootEl.style.display = 'inherit'
      this.lootInventory = lootOrShop.inventory;
      this.lootItemsEl.append(...this.addItemSlots(this.lootInventory, 'loot'))
    } else {
      this.lootEl.style.display = 'none'
      this.lootInfo.style.display = 'none'
      this.lootInventory = undefined
    }

    this.updateStats()
  }

  private updateMoney() {
    this.charMoneyEl.textContent = ''
    this.charMoneyEl.appendChild(ColorText(this.character.money, 'Money'))
    if (this.shop) {
      this.shopMoneyEl.textContent = ''
      this.shopMoneyEl.appendChild(ColorText(this.shop.money, 'Money'))
    }
  }
  private updateLevel() {
    this.charLevelEl.textContent = ''
    this.charLevelEl.appendChild(ColorText(this.character.level, 'Level'))

  }

  private updateStats() {
    this.statsEl.textContent = ''
    this.updateMoney()
    this.updateLevel()
    this.healthBar.set(this.stats.health, this.stats.maxHealth)
    this.staminaBar.set(this.stats.stamina, this.stats.maxStamina)
    this.levelBar.set(this.character.exp, expToNextLevel(this.character.level))

    for (const key in this.stats) {
      if (Object.prototype.hasOwnProperty.call(this.stats, key)) {
        const stat = this.stats[key as keyof CharacterStats]
        switch (key as keyof CharacterStats) {
          case 'aiDodgeChance':
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
    this.tooltip.mainEl.remove()
    window.removeEventListener('mousemove', this.mousemove)
    window.removeEventListener('mouseup', this.mouseup)
    window.removeEventListener('keydown', this.keydown)
    this.shopMoneyEl.style.display = 'none'
    if (this.shop) {
      this.shop = undefined
      this.createAllSlots()
    }
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
    const slotID = this.getSlotId(slotInfo)

    const itemName = this.getItem(slotInfo)

    const priceTag = this.getPriceTag(slotInfo.type, itemName)

    const slot = <div id={`${slotID}${slotInfo.id}`} className={inventorySlotClassList(!this.getItem(slotInfo))} onMouseDown={(e) => {
      e.preventDefault()
      const item = this.getItem(slotInfo)

      if (item) {
        if (e.ctrlKey) { // TODO add ability to add keybindings if necessary with a keydown/up listener.
          if (this.equipOrUseItem(slotInfo, item))
            return
        } else if (e.shiftKey) {
          if (this.moveItemToInventory(slotInfo))
            return
        } else if (e.altKey) {
          if (this.moveItemToLoot(slotInfo))
            return
        }

        this.updateSlot(this.dragAndDropSlot, slotInfo, item, false)
        this.draggedSlotInfo = slotInfo
        this.parentEl.appendChild(this.dragAndDropSlot)

        const bounds = this.dragAndDropSlot.getBoundingClientRect()
        this.offset.x = -(bounds.width / 2)
        this.offset.y = -(bounds.height / 2)
        this.dragAndDropSlot.style.transform = `translate(${this.mousePos.x + this.offset.x}px, ${this.mousePos.y + this.offset.y}px)`

        slot.classList.add('inventory-is-dragging')

      }
    }}>{itemName || this.getEmptySlotName(slotInfo)}{priceTag}</div>

    slot.onmouseenter = () => this.showTooltip(slotInfo, slot)
    slot.onmouseleave = () => this.tooltip.hide()

    return slot
  }

  private equipOrUseItem(slot: SlotInfo, item: ItemName) {
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
        for (const key in ITEM_TYPES) {
          if (Object.prototype.hasOwnProperty.call(ITEM_TYPES, key)) {
            const target = document.getElementById(`${this.characterItemId}${key}`)
            if (target && ITEMS[item].type === key) {
              this.dropItem(target, slot, { type: 'character', id: key as any })
              return true;
            }
          }
        }
        const itemInfo = ITEMS[item]
        if (itemInfo.type === 'consumable') {
          useConsumable(this.character, this.stats, itemInfo)
          this.setItem(slot, undefined)
          this.updateSlot(this.getSlotElement(slot), slot)
          this.updateStats()
          this.tooltip.hide()
          return true
        }
        break;
    }
  }

  private getSlotElement(slot: Required<SlotInfo>): HTMLElement {
    return document.getElementById(`${this.getSlotId(slot)}${slot.id}`)!
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

  private getSlotId(slot: SlotInfo) {
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

  private getPriceTag(type: SlotInfo['type'], itemName?: ItemName) {
    if (this.shop && itemName) {
      const price = this.shop.prices[itemName]
      if (price) {
        if (type === 'loot') {
          return <div className="inventory-price">{ColorText(price.buy, 'Money')}</div>
        } else {
          return <div className="inventory-price">{ColorText(price.sell, 'Money')}</div>
        }
      } else {
        return <div className="inventory-price"><span className="inventory-not-for-sale">Not for sale</span></div>
      }
    }
    return <span></span>
  }

  private keydown = (e: KeyboardEvent) => {
    e.preventDefault()
    switch (e.key.toUpperCase()) {
      case getKeybinding('Inventory', 'ToggleInventory'):
        this.toggle()
        break;
    }
  }
  private mousemove = (e: MouseEvent) => {
    this.mousePos.x = e.pageX
    this.mousePos.y = e.pageY
    if (this.draggedSlotInfo) {
      this.dragAndDropSlot.style.transform = `translate(${this.mousePos.x + this.offset.x}px, ${this.mousePos.y + this.offset.y}px)`
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
        if (!droppedItem) return;
        const id = target.id.replace(this.characterItemId, '') as keyof Character['items']
        const itemStats = ITEMS[droppedItem]
        if (itemStats && itemStats.type === id) {
          this.dropItem(target, this.draggedSlotInfo, { id: id, type: 'character' })
        } else {
          this.cancelDrop(this.draggedSlotInfo)
        }
      } else {
        this.cancelDrop(this.draggedSlotInfo)
      }
      this.dragAndDropSlot.remove()
      this.draggedSlotInfo = undefined
    }
  }

  private cancelDrop(slot: Required<SlotInfo>) {
    const oldEl = this.getSlotElement(slot)
    oldEl.classList.remove('inventory-is-dragging')
  }

  private dropItem(target: HTMLElement, draggedSlotInfo: Required<SlotInfo>, targetSlotInfo: Required<SlotInfo>) {
    const droppedItemName = this.getItem(draggedSlotInfo)
    if (!droppedItemName) return // just to be sure, this should never happen, since you can't drag an empty slot.
    const oldItemName = this.getItem(targetSlotInfo)
    if (droppedItemName === oldItemName) { this.cancelDrop(draggedSlotInfo); return };
    if (this.shop) {
      // check if item can be sold.
      // and check if sold and char or shop has enough money.
      switch (draggedSlotInfo.type) {
        case 'loot':
          if (targetSlotInfo.type === 'loot') break;

          const price = this.shop.prices[droppedItemName]
          if (!price) {
            this.cancelDrop(draggedSlotInfo)
            return
          }

          const oldItemPrice = oldItemName && this.shop.prices[oldItemName]?.sell || 0
          const buyPrice = price.buy - oldItemPrice

          // buy
          if (this.character.money - buyPrice >= 0) {
            this.character.money -= buyPrice
            this.shop.money += buyPrice
            this.updateMoney()
          } else {
            this.cancelDrop(draggedSlotInfo)
            return // not enough money to buy.
          }
          break;
        case 'character':
        case 'inventory':
          if (targetSlotInfo.type === 'loot') {
            const price = this.shop.prices[droppedItemName]
            if (!price) {
              this.cancelDrop(draggedSlotInfo)
              return
            }

            const oldItemPrice = oldItemName && this.shop.prices[oldItemName]?.buy || 0
            const sellPrice = price.sell - oldItemPrice

            // sell
            if (this.shop.money - sellPrice >= 0) {
              this.shop.money -= sellPrice
              this.character.money += sellPrice
              this.updateMoney()
            } else {
              this.cancelDrop(draggedSlotInfo)
              return // not enough money to sell.
            }
          }
          break;
      }
    }

    this.tooltip.hide()
    this.updateSlot(target, targetSlotInfo, droppedItemName)
    this.updateSlot(document.getElementById(`${this.getSlotId(draggedSlotInfo)}${draggedSlotInfo.id}`)!, draggedSlotInfo, oldItemName)

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

  private updateSlot(element: HTMLElement, slotInfo: Required<SlotInfo>, itemName?: ItemName, updateClasses = true) {
    updateClasses && (element.className = inventorySlotClassList(!itemName));
    element.textContent = itemName || this.getEmptySlotName(slotInfo)
    element.appendChild(this.getPriceTag(slotInfo.type, itemName))
  }

  private getItemStatChanges(slot: Required<SlotInfo>, itemName?: ItemName) {
    if (!itemName) return;
    const itemStatChanges = ITEMS[itemName]
    return slot.type === 'character' && itemStatChanges.type === slot.id && itemStatChanges
  }

  private showTooltip(slotInfo: SlotInfo, slotEl: HTMLElement) {
    const itemName = this.getItem(slotInfo)
    if (itemName) {
      const itemInfo = ITEMS[itemName]
      const bounds = slotEl.getBoundingClientRect()

      const elements: HTMLElement[] = []
      if (itemInfo.type === 'quest') {
        elements.push(StatEl('QUEST ITEM', true))
      } else if (itemInfo.type === 'consumable') {
        const health = itemInfo.effect.health
        if (health) {
          elements.push(<span ><span>Heal: </span> {StatEl(`${health === 'Full' ? health : `+${health}%`}`, true)}</span>)
        }
        const exp = itemInfo.effect.exp
        if (exp) {
          elements.push(<span ><span>Gain Exp: </span> {ColorText(`${exp === 'Level' ? `+${expGainAtLevel(this.character.level)}` : `+${exp}`}`, 'Level')}</span>)
        }
      } else {
        this.addItemInfoToTooltip(itemInfo, elements)

        if (slotInfo.type === 'inventory' || slotInfo.type === 'loot') {
          for (const key in ITEM_TYPES) {
            if (Object.prototype.hasOwnProperty.call(ITEM_TYPES, key)) {
              const target = document.getElementById(`${this.characterItemId}${key}`)
              if (target && itemInfo.type === key) {
                const charItem = this.character.items[key]
                if (charItem) {
                  elements.push(<span style={{ textAlign: 'center' }}>Equipped Item</span>)
                  this.addItemInfoToTooltip(ITEMS[charItem] as ItemWithStatChange, elements)
                }
              }
            }
          }
        }
      }

      this.tooltip.show(
        <div className="inventory-tooltip">
          {elements}
        </div>,
        { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height + 4 }
      )
    }
  }

  private addItemInfoToTooltip(itemInfo: ItemWithStatChange, elements: HTMLElement[]) {
    for (const key in itemInfo.statChanges) {
      if (Object.prototype.hasOwnProperty.call(itemInfo.statChanges, key)) {
        const change = itemInfo.statChanges[key as keyof typeof itemInfo.statChanges]

        if (typeof change === 'number') {
          const changeType = change >= 0
          let changeTypeClass = change >= 0
          if (FLIPPED_STAT_SIGN[key as keyof typeof itemInfo.statChanges]) {
            changeTypeClass = !changeType
          }
          elements.push(<div className="inventory-stat">
            <span>{key}:</span>
            {StatEl(this.statSign(change, changeType), changeTypeClass)}
          </div>)
        } else if (change) {
          const typeMin = change.min > 0
          const typeMax = change.max > 0
          elements.push(<div className="inventory-stat">
            <span>{key}:</span>
            <span>{StatEl(this.statSign(change.min, typeMin), typeMin)} - {StatEl(this.statSign(change.max, typeMax), typeMax)}</span>
          </div>)
        }
      }
    }
  }

  private statSign(change: number | string, type: boolean) {
    if (typeof change === 'string') return change
    return `${type ? '+' : '-'}${Math.abs(change)}`
  }
}

function inventorySlotClassList(isEmpty: boolean) {
  return isEmpty ? 'inventory-slot' : 'inventory-slot inventory-drag'
}
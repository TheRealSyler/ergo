import { h } from 'dom-chef'
import { Campaign } from '../campaign/campaign'
import './campaignUI.sass'
import { MoneyEl } from './components'
import { TooltipComponent } from './tooltipComponent'
import { MAIN_UI_ELEMENT } from './ui'

export class campaignUI {
  private townsEl = <div className="campaign-towns"></div>
  private tooltip = new TooltipComponent()
  private townElId = 'campaign-town-'
  private selectedTownEl?: HTMLElement | null
  private dungeonsEl = <div className="campaign-list"></div>
  private shopsEl = <div className="campaign-list"></div>
  private mainEl = <div className="fixed campaign">
    <div className="campaign-section">
      <h1>Shops</h1>
      {this.shopsEl}
    </div>
    <div className="campaign-section">
      <h1>Towns</h1>
      {this.townsEl}
      <h1>Dungeons</h1>
      {this.dungeonsEl}
    </div>
  </div>

  enabled = true
  constructor(private ref: Campaign) { }

  show() {
    this.tooltip.hide()
    this.enabled = true
    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(this.mainEl)
    MAIN_UI_ELEMENT.appendChild(this.tooltip.mainEL)

    this.townsEl.textContent = ''

    for (const key in this.ref.towns) {
      if (Object.prototype.hasOwnProperty.call(this.ref.towns, key)) {
        const el = <div id={`${this.townElId}${key}`} className="button campaign-town" onClick={() => {
          this.ref.changeTown(key as keyof Campaign['towns'])
        }}>{key}</div>

        const town = this.ref.towns[key as keyof Campaign['towns']]
        if (town.isUnlocked) {
          this.addTooltip(el, <span>Travel to {key} (Travel cost {MoneyEl(town.travelCost)})</span>)
        } else {
          this.addTooltip(el, <span>You cannot travel to {key}</span>)
        }
        this.townsEl.appendChild(el)
      }
    }

    this.selectedTownEl?.classList.remove('selected')
    this.selectedTownEl = document.getElementById(`${this.townElId}${this.ref.currentTown}`)
    this.selectedTownEl?.classList.add('selected')
    if (this.selectedTownEl) {
      this.addTooltip(this.selectedTownEl, <span>You are in {this.ref.currentTown}</span>)
    }
    this.dungeonsEl.textContent = ''

    for (const key in this.ref.towns[this.ref.currentTown].dungeons) {
      if (Object.prototype.hasOwnProperty.call(this.ref.towns[this.ref.currentTown].dungeons, key)) {
        const dungeon = this.ref.towns[this.ref.currentTown].dungeons[key]
        const el = <div className="button" onClick={() => {
          if (this.enabled) {
            this.ref.loadDungeon(dungeon)
          }
        }}>{key}</div>
        this.addTooltip(el, <span>Travel to {key}{dungeon.cost ? <span> (Travel cost {MoneyEl(dungeon.cost)})</span> : null}</span>)
        this.dungeonsEl.appendChild(el)
      }
    }

    this.shopsEl.textContent = ''
    // TODO add keybindings for opening a shop.
    for (let i = 0; i < this.ref.towns[this.ref.currentTown].shops.length; i++) {
      const shop = this.ref.towns[this.ref.currentTown].shops[i];
      const el = <div className="button" onClick={() => {
        this.ref.inventoryUI.showShop(shop)
      }}>
        {shop.name}
      </div>
      this.addTooltip(el, <span>Open Shop</span>)
      this.shopsEl.appendChild(el)
    }

    this.mainEl.classList.add('campaign-show')
    this.mainEl.classList.remove('campaign-hide')
  }
  hide() {
    this.enabled = false
    this.mainEl.classList.add('campaign-hide')
    this.mainEl.classList.remove('campaign-show')
  }

  private addTooltip(el: HTMLElement, tooltip: HTMLElement) {
    el.onmouseenter = () => {
      const b = el.getBoundingClientRect()

      this.tooltip.show(tooltip, { x: b.x + b.width / 2, y: b.y + b.height + 10 })
    }
    el.onmouseleave = () => this.tooltip.hide()
  }
}
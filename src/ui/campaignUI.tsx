import { h } from 'dom-chef'
import { Campaign } from '../campaign/campaign'
import './campaignUI.sass'
import { TooltipComponent } from './tooltipComponent'
import { MAIN_UI_ELEMENT } from './ui'

export class campaignUI {
  private townsEl = <div className="campaign-towns"></div>
  private tooltip = new TooltipComponent()
  private townElId = 'campaign-town-'
  private selectedTownEl?: HTMLElement | null
  private dungeonsEl = <div className="campaign-dungeons"></div>
  private shopsEl = <div className="campaign-shops"></div>
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
  constructor(private ref: Campaign) {
    for (const key in ref.towns) {
      if (Object.prototype.hasOwnProperty.call(ref.towns, key)) {
        const el = <div id={`${this.townElId}${key}`} className="button campaign-town" onClick={() => {
          this.ref.changeTown(key as keyof Campaign['towns'])
        }}>{key}</div>
        this.addTooltip(el, `Travel to ${key}`)
        this.townsEl.appendChild(el)
      }
    }
  }

  show() {
    this.enabled = true
    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(this.mainEl)
    MAIN_UI_ELEMENT.appendChild(this.tooltip.mainEL)
    this.selectedTownEl?.classList.remove('selected')
    this.selectedTownEl = document.getElementById(`${this.townElId}${this.ref.currentTown}`)
    this.selectedTownEl?.classList.add('selected')
    if (this.selectedTownEl) {
      this.addTooltip(this.selectedTownEl, `You are in ${this.ref.currentTown}`)
    }
    this.dungeonsEl.textContent = ''

    for (const key in this.ref.towns[this.ref.currentTown].dungeons) {
      if (Object.prototype.hasOwnProperty.call(this.ref.towns[this.ref.currentTown].dungeons, key)) {
        const el = <div className="button" onClick={() => {
          if (this.enabled) {
            this.ref.loadDungeon(this.ref.towns[this.ref.currentTown].dungeons[key])
          }
        }}>{key}</div>
        this.addTooltip(el, `Travel to ${key}`)
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
      this.addTooltip(el, 'Open Shop')
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

  private addTooltip(el: HTMLElement, text: string) {
    el.onmouseenter = () => {
      const b = el.getBoundingClientRect()

      this.tooltip.show(<div>{text}</div>, { x: b.x + b.width / 2, y: b.y + b.height + 10 })
    }
    el.onmouseleave = () => this.tooltip.hide()
  }
}
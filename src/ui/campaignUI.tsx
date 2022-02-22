import { h } from 'dom-chef'
import { Campaign } from '../campaign/campaign'
import './campaignUI.sass'
import { ColorText } from './components'
import { TooltipComponent } from './tooltipComponent'
import { MAIN_UI_ELEMENT } from './ui'

export class campaignUI {
  private townsEl = <div className="campaign-towns"></div>
  public tooltip = new TooltipComponent()
  private townElId = 'campaign-town-'
  private selectedTownEl?: HTMLElement | null
  private dungeonsEl = <div className="campaign-list"></div>
  private shopsEl = <div className="campaign-list"></div>
  private mainEl = <div className="fixed campaign">
    <div className="campaign-section">
      <h1>Quest</h1>
      <div className="campaign-list"><div className="button" onClick={() => this.campaign.questBoardUI.toggle()}>Quest Board</div></div>
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
  constructor(private campaign: Campaign) { }

  show() {
    this.enabled = true
    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(this.mainEl)
    MAIN_UI_ELEMENT.appendChild(this.tooltip.mainEl)

    this.townsEl.textContent = ''

    for (const key in this.campaign.towns) {
      if (Object.prototype.hasOwnProperty.call(this.campaign.towns, key)) {
        const el = <div id={`${this.townElId}${key}`} className="button campaign-town" onClick={() => {
          this.campaign.changeTown(key as keyof Campaign['towns'])
        }}>{key}</div>

        const town = this.campaign.towns[key as keyof Campaign['towns']]
        if (town.isUnlocked) {
          if (town.hasBeenVisited) {
            this.addTooltip(el, <span> Travel to {key}</span>)
          } else {
            this.addTooltip(el, <span> Travel to {key} (Travel cost {ColorText(town.travelCost, 'Money')}) <br />{!this.campaign.EnoughMoneyCheck(town.travelCost) && ColorText(" You don't have enough money.", 'StatNeg')}</span>)
          }
        } else {
          this.addTooltip(el, <span>You cannot travel to {key}</span>)
        }
        this.townsEl.appendChild(el)
      }
    }

    this.selectedTownEl?.classList.remove('selected')
    this.selectedTownEl = document.getElementById(`${this.townElId}${this.campaign.currentTown}`)
    this.selectedTownEl?.classList.add('selected')
    if (this.selectedTownEl) {
      this.addTooltip(this.selectedTownEl, <span>You are in {this.campaign.currentTown}</span>)
    }
    this.dungeonsEl.textContent = ''

    for (const key in this.campaign.towns[this.campaign.currentTown].dungeons) {
      if (Object.prototype.hasOwnProperty.call(this.campaign.towns[this.campaign.currentTown].dungeons, key)) {
        const dungeon = this.campaign.towns[this.campaign.currentTown].dungeons[key]
        const el = <div className="button" onClick={() => {
          if (this.enabled) {
            this.campaign.loadDungeon(dungeon)
          }
        }}>{key}</div>
        if (dungeon.hasBeenCompleted) {
          el.classList.add('campaign-completed-dungeon')
        }
        if (dungeon.cost) {
          this.addTooltip(el, <span> Travel to {key}{
            dungeon.cost ? <span> (Travel cost {ColorText(dungeon.cost, 'Money')})</span> : null}{dungeon.hasBeenCompleted && ' (Completed)'}
            <br />{!this.campaign.EnoughMoneyCheck(dungeon.cost) && ColorText(" You don't have enough money.", 'StatNeg')}
          </span>)
          this.dungeonsEl.appendChild(el)
        } else {
          this.addTooltip(el, <span> Travel to {key}{dungeon.hasBeenCompleted && ' (Completed)'}</span>)
          this.dungeonsEl.appendChild(el)
        }
      }
    }

    this.shopsEl.textContent = ''
    // TODO add keybindings for opening a shop.
    for (let i = 0; i < this.campaign.towns[this.campaign.currentTown].shops.length; i++) {
      const shop = this.campaign.towns[this.campaign.currentTown].shops[i];
      const el = <div className="button" onClick={() => {
        this.campaign.inventoryUI.showShop(shop)
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
    this.tooltip.hide()
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
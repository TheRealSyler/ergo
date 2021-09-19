import { h } from 'dom-chef'
import { Campaign } from '../campaign/campaign'
import './campaignUI.sass'
import { MAIN_UI_ELEMENT } from './ui'

export class campaignUI {
  private townsEl = <div className="campaign-towns"></div>
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
        this.townsEl.appendChild(<div id={`${this.townElId}${key}`} className="button campaign-town" onClick={() => {
          this.ref.changeTown(key as keyof Campaign['towns'])
        }}>{key}</div>)
      }
    }

  }

  show() {
    this.enabled = true
    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(this.mainEl)
    this.selectedTownEl?.classList.remove('selected')
    this.selectedTownEl = document.getElementById(`${this.townElId}${this.ref.currentTown}`)
    this.selectedTownEl?.classList.add('selected')

    this.dungeonsEl.textContent = ''

    for (const key in this.ref.towns[this.ref.currentTown].dungeons) {
      if (Object.prototype.hasOwnProperty.call(this.ref.towns[this.ref.currentTown].dungeons, key)) {
        this.dungeonsEl.appendChild(<div className="button" onClick={() => {
          if (this.enabled) {
            this.ref.loadDungeon(this.ref.towns[this.ref.currentTown].dungeons[key])
          }
        }}>{key}</div>)
      }
    }

    this.shopsEl.textContent = ''
    // TODO add keybindings for opening a shop.
    for (let i = 0; i < this.ref.towns[this.ref.currentTown].shops.length; i++) {
      const shop = this.ref.towns[this.ref.currentTown].shops[i];
      this.shopsEl.appendChild(<div className="button" onClick={() => {
        this.ref.inventoryUI.showShop(shop)
      }}>
        {shop.name}
      </div>)
    }

    this.mainEl.classList.add('campaign-show')
    this.mainEl.classList.remove('campaign-hide')
  }
  hide() {
    this.enabled = false
    this.mainEl.classList.add('campaign-hide')
    this.mainEl.classList.remove('campaign-show')
  }
}
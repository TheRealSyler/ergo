import { h } from 'dom-chef'
import { Campaign } from '../campaign/campaign'
import './campaignUI.sass'
import { MAIN_UI_ELEMENT } from './ui'

export class campaignUI {
  private townsEl = <div className="campaign-towns"></div>
  private townElId = 'campaign-town-'
  private selectedTownEl?: HTMLElement | null
  private dungeonsEl = <div className="campaign-dungeons"></div>
  private mainEl = <div className="fixed campaign">
    <div>

    </div>
    <div className="campaign-travel">
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
            console.log('TODO launch dungeon.', key)
          }
        }}>{key}</div>)
      }
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
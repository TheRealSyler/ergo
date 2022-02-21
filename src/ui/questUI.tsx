import { h } from 'dom-chef'
import { Campaign } from '../campaign/campaign'
import { MAIN_QUESTS } from '../campaign/quests'
import './questUI.sass'
import { MAIN_UI_ELEMENT } from './ui'


export class QuestUI {
  private mainEl = <div className="fixed quest"></div>
  constructor(private campaign: Campaign) {
  }

  show() {
    MAIN_UI_ELEMENT.appendChild(this.mainEl)
    if (this.campaign.quest.main) {
      const questInfo = MAIN_QUESTS[this.campaign.quest.main]
      this.mainEl.textContent = `[${this.campaign.quest.main}] ${questInfo.description}`
    }
  }
  hide() {
    this.mainEl.remove()
  }
}
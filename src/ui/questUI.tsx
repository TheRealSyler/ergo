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
      this.mainEl.textContent = `Quest: ${this.campaign.quest.main} Objective: item ${questInfo.objective.getItem} travel ${questInfo.objective.travelToTown}`
    }
  }
  hide() {
    this.mainEl.remove()
  }
}
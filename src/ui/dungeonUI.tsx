import { h } from 'dom-chef'
import { CampaignQuestNames, CAMPAIGN_QUESTS } from '../campaign/quests'
import './dungeonUI.sass'
import { MAIN_UI_ELEMENT } from './ui'

export class DungeonUI {

  private activeObjectDiv = <div className="dungeon-active"></div>
  private questEL = <div className="fixed dungeon-quest"></div>
  constructor(private quests?: CampaignQuestNames[]) { }

  show() {
    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(
      <div className="fixed">
        {this.activeObjectDiv}
        <div className="dungeon-crosshair center-fixed"></div>
      </div>
    )
    if (this.quests) {

      MAIN_UI_ELEMENT.appendChild(this.questEL)
      this.questEL.textContent = ''
      for (let i = 0; i < this.quests.length; i++) {
        const questName = this.quests[i];
        const questInfo = CAMPAIGN_QUESTS[questName]
        const el = document.createElement('div')
        el.textContent = `[${questName}] ${questInfo.description}`
        this.questEL.appendChild(el)
      }
    }
  }

  showActiveObject(text: string) {
    this.activeObjectDiv.textContent = text
  }
}
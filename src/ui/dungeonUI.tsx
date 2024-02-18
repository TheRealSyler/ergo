import { h } from 'dom-chef'
import { CAMPAIGN_QUESTS, type CampaignQuestNames } from '../campaign/quests'
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
      for (const questName of this.quests) {
        const questInfo = CAMPAIGN_QUESTS[questName]
        this.questEL.appendChild(<div>[{questName}] {questInfo.description}</div>)
      }
    }
  }

  showActiveObject(text: string) {
    this.activeObjectDiv.textContent = text
  }
}
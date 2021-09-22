import { h } from 'dom-chef'
import { Campaign, TownName } from '../campaign/campaign'
import { MAIN_QUESTS, Quest } from '../campaign/quests'
import { getKeybinding, getKeybindingUI } from '../keybindings'
import { StatEl } from './components'
import './questBoard.sass'
import { MAIN_UI_ELEMENT } from './ui'

export class QuestBoardUI {
  private questsEl = <div></div>
  private mainEl = <div className="fixed modal quest-board">

    {this.questsEl}
    <div>
      <span className="button" onClick={() => this.toggle()}> {getKeybindingUI('Campaign', 'OpenQuestBoard')} Close</span>
    </div>
  </div>
  constructor(private campaign: Campaign) {
  }
  visible = false

  toggle() {
    if (this.visible) {
      this.hide()
    } else {
      this.show()
    }
  }

  show() {
    MAIN_UI_ELEMENT.appendChild(this.mainEl)
    this.questsEl.textContent = ''
    if (this.campaign.quest.main) {
      const mainQuest = MAIN_QUESTS[this.campaign.quest.main]

      this.questsEl.appendChild(<h1>Main Quest</h1>)
      this.questsEl.appendChild(this.addQuest(mainQuest, this.campaign.quest.main, true))
    }
    this.questsEl.appendChild(<h1>Side Quests</h1>)
    // TODO add side quests.
    window.addEventListener('keydown', this.keydown)
    this.visible = true
  }
  private addQuest(quest: Quest<TownName, any, any>, questName: string, isMain = false) {
    const { canBeCompleted, getItem: hasItem, travelToTown: hasTraveledTo } = this.campaign.checkQuest(quest)

    let status;
    if (canBeCompleted) {
      status = <span className="button" onClick={() => {
        this.campaign.completeQuest(quest, questName, isMain)
      }}>Complete Quest</span>
    } else {
      status = <span className="quest-board-status">
        {quest.objective.getItem && <span>Get item: {StatEl(quest.objective.getItem, hasItem)}</span>}
        {quest.objective.travelToTown ? <span>Go to: {StatEl(quest.objective.travelToTown, hasTraveledTo)}</span> : ''}
      </span>
    }
    return <div className="quest-board-quest">
      <span>{this.campaign.quest.main}</span>
      <span>{status}</span>
    </div>
  }

  hide() {
    window.removeEventListener('keydown', this.keydown)
    this.mainEl.remove()
    this.visible = false
  }


  private keydown = (e: KeyboardEvent) => {
    switch (e.key.toUpperCase()) {
      case getKeybinding('Campaign', 'OpenQuestBoard'):
        e.preventDefault()
        this.toggle()
        break;
    }
  }
}
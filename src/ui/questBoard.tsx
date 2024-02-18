import { h } from 'dom-chef'
import { Campaign, type TownName } from '../campaign/campaign'
import { CAMPAIGN_QUESTS, type Quest } from '../campaign/quests'
import { getKeybinding, getKeybindingUI } from '../keybindings'
import { StatEl } from './components'
import './questBoard.sass'
import { MAIN_UI_ELEMENT } from './ui'

export class QuestBoardUI {
  private questsEl = <div className="quest-board-quests"></div>
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
    this.questsEl.appendChild(<h1>Quest Board</h1>)
    for (const quest of this.campaign.quests) {
      this.questsEl.appendChild(this.addQuest(CAMPAIGN_QUESTS[quest], quest))
    }

    window.addEventListener('keydown', this.keydown)
    this.visible = true
  }
  private addQuest(quest: Quest<TownName, string>, questName: string) {
    const { canBeCompleted, getItem: hasItem, travelToTown: hasTraveledTo, completeDungeon } = this.campaign.checkQuest(quest)

    let status
    if (canBeCompleted) {
      status = <span className="button" onClick={() => {
        this.campaign.completeQuest(quest, questName)
      }}>Complete Quest</span>
    } else {
      status = <span className="quest-board-status">
        {quest.objective.getItem && <span>Get item: {StatEl(quest.objective.getItem, hasItem)}</span>}
        {quest.objective.travelToTown && <span>Go to: {StatEl(quest.objective.travelToTown, hasTraveledTo)}</span>}
        {quest.objective.completeDungeon && <span>Complete Dungeon: {StatEl(quest.objective.completeDungeon.dungeon, completeDungeon)} in {quest.objective.completeDungeon.town}</span>}
      </span>
    }
    return <div className="quest-board-quest">
      <span>{questName}</span>
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
        break
    }
  }
}
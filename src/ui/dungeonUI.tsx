import { h } from 'dom-chef'
import './dungeonUI.sass'
import { MAIN_UI_ELEMENT } from './ui'

export class DungeonUI {
  private activeObjectDiv = <div className="dungeon-active"></div>
  show() {
    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(
      <div className="dungeon">
        {this.activeObjectDiv}
      </div>
    )
  }

  showActiveObject(text: string) {
    this.activeObjectDiv.textContent = text
  }
}
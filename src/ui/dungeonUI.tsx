import { h } from 'dom-chef'
import './dungeonUI.sass'
import { MAIN_UI_ELEMENT } from './ui'

export class DungeonUI {
  private activeObjectDiv = <div className="dungeon-active"></div>
  show() {
    MAIN_UI_ELEMENT.textContent = ''
    MAIN_UI_ELEMENT.appendChild(
      <div className="fixed">
        {this.activeObjectDiv}
        <div className="dungeon-crosshair center-fixed"></div>
      </div>
    )
  }

  showActiveObject(text: string) {
    this.activeObjectDiv.textContent = text
  }
}
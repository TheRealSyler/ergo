import { h } from 'dom-chef'
import { toFixedIfNotZero } from '../utils'
import './barComponent.sass'

export class BarComponent {
  private textEl = <div className="bar-text"></div>
  private barEl = <div className="bar-bar">{this.textEl}</div>
  private mainEl = <div className="bar-main">{this.barEl}</div>
  constructor(type: 'stamina' | 'health', private fractionDigits = 1) {
    if (type === 'health') {
      this.barEl.style.background = 'red'
    } else {
      this.barEl.style.background = 'green'
    }

  }

  getEl() {
    return this.mainEl
  }

  set(current: number, max: number) {
    const c = Math.max(current, 0)
    this.textEl.textContent = toFixedIfNotZero(c, this.fractionDigits)
    this.barEl.style.width = `${(c / max) * 100}%`
  }
}
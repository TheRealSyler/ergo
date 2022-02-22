import { h } from 'dom-chef'
import { toFixedIfNotZero } from '../utils'
import './barComponent.sass'

export const BAR_COLORS = {
  health: 'red',
  stamina: 'green',
  level: '#07a'
}

export class BarComponent {
  private textEl = <div className="bar-text"></div>
  private barEl = <div className="bar-bar">{this.textEl}</div>
  private mainEl = <div className="bar-main">{this.barEl}</div>
  constructor(bg: string, private fractionDigits = 1) {
    this.barEl.style.background = bg
    this.mainEl.addEventListener('mouseenter', () => {
      this.textEl.textContent = `${toFixedIfNotZero(this.current, this.fractionDigits)} / ${this.max}`
    })
    this.mainEl.addEventListener('mouseleave', () => {
      this.textEl.textContent = toFixedIfNotZero(this.current, this.fractionDigits)
    })
  }

  getEl() {
    return this.mainEl
  }
  private current = 0
  private max = 0
  set(current: number, max: number) {
    const c = Math.max(current, 0)
    this.current = c
    this.max = max
    this.textEl.textContent = toFixedIfNotZero(c, this.fractionDigits)
    this.barEl.style.width = `${(c / max) * 100}%`
  }
}
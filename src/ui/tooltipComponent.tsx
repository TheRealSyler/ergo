import { h } from 'dom-chef'
import './tooltipComponent.sass'

export class TooltipComponent {
  mainEL = <div className="fixed tooltip"></div>

  setPos(pos: { x: number, y: number }) {
    const bounds = this.mainEL.getBoundingClientRect()

    let xOffset = 0
    const tempX = pos.x + (bounds.width / 2)
    if (tempX > window.innerWidth) {
      xOffset = -(tempX - window.innerWidth)
    }
    const tempX2 = pos.x - (bounds.width / 2)
    if (tempX2 < 0) {
      xOffset = -tempX2
    }
    let yOffset = 0
    if (pos.y + bounds.height > window.innerHeight) {
      yOffset = -bounds.height
    }
    const x = pos.x - (bounds.width / 2) + xOffset
    const y = pos.y + yOffset
    this.mainEL.style.transform = `translate(${x}px, ${y}px)`
  }

  show(content: HTMLElement, pos?: { x: number, y: number }) {
    this.mainEL.textContent = ''
    this.mainEL.appendChild(content)
    if (pos) {
      this.setPos(pos)
    }
    this.mainEL.classList.remove('tooltip-hide')
    this.mainEL.classList.add('tooltip-show')
  }

  hide() {
    this.mainEL.classList.remove('tooltip-show')
    this.mainEL.classList.add('tooltip-hide')
  }

  removeClasses() {
    this.mainEL.classList.remove('tooltip-hide')
    this.mainEL.classList.remove('tooltip-show')

  }
}
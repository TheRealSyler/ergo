import { h } from 'dom-chef'
import { toPx } from '../utils'
import './notifications.sass'


export class Notifications {

  private slots: boolean[] = []
  async Show(text: string | HTMLElement, button?: { func: () => void, text: string | HTMLElement }, hideDelay = 4) {
    const height = 40
    const timeout = setTimeout(() => close(), hideDelay * 1000)
    const index = this.findFreeSlot()
    const close = () => {
      mainEl.classList.remove('notification-show')
      mainEl.classList.add('notification-hide')
      mainEl.addEventListener('animationend', () => {
        this.slots[index] = false
        mainEl.remove()
        clearTimeout(timeout)
      })
    }
    const mainEl =
      <div className="notification-parent notification-show">
        <div className="notification">

          <span >{text}</span>
          {button ? <span className="button" onClick={() => {
            close()
            button.func()
          }}>{button.text}</span> : null}


          <span className="button notification-left" onClick={close}>X</span>

        </div>

      </div>
    mainEl.style.height = toPx(height)


    const gap = 10
    mainEl.style.bottom = toPx(((index * height) + (gap * index) + gap))
    this.slots[index] = true
    document.body.appendChild(mainEl)

  }
  private findFreeSlot() {
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      if (slot === false) {
        return i
      }
    }
    return this.slots.length
  }
}
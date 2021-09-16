import { h } from 'dom-chef'
import { LoadingManager } from 'three'
import './loaderUI.sass'
import { MAIN_UI_ELEMENT } from './ui'

export function LoaderUI(manager?: LoadingManager, info?: string) {
  MAIN_UI_ELEMENT.textContent = ''

  const progressEL = <div className="loader-progress">0</div>
  if (manager) {
    manager.onProgress = (url, number, total) => {
      progressEL.textContent = `${number} / ${total} - ${url}`
    }
  }

  MAIN_UI_ELEMENT.appendChild(<div className="loader fixed">
    <div className="loader-info">{info}</div>
    <div className="loader-spinner"></div>
    {manager && progressEL}
  </div>)

}
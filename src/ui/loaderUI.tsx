import { h } from 'dom-chef'
import './loaderUI.sass'
import { MAIN_UI_ELEMENT } from './ui'

export function LoaderUI() {
  MAIN_UI_ELEMENT.textContent = ''

  MAIN_UI_ELEMENT.appendChild(<div className="loader">
    <div className="loader-spinner"></div>
  </div>)
}
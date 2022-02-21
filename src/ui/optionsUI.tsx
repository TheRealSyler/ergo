import { getOption, setOption } from '../options'
import './optionsUI.sass'
import { MAIN_UI_ELEMENT } from './ui'
import { h } from 'dom-chef'
import { getKeybinding, getKeybindingUI } from '../keybindings'

export function OptionsUI(onClose: () => void) {
  const mainEL = <div className="fixed modal options">
    <div>
      <h1>Options</h1>
      enableMouseAttacks [Experimental]: <input type="checkbox" name="Enable Mouse Attack" checked={getOption('input', 'enableMouseAttacks')} onChange={(e) => {
        setOption('input', 'enableMouseAttacks', e.target.checked)
      }} />
    </div>
    <div>
      <span className="button" onClick={() => {
        mainEL.remove()
      }}>{getKeybindingUI('PauseMenu', 'Options')} Close</span>
    </div>
  </div>
  const listener = (e: KeyboardEvent) => {
    switch (e.key.toUpperCase()) {
      case getKeybinding('PauseMenu', 'Options'):
        mainEL.remove()
        window.removeEventListener('keydown', listener)
        onClose()
        break;
    }
  }
  window.addEventListener('keydown', listener)

  MAIN_UI_ELEMENT.appendChild(mainEL)
}
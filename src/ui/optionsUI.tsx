import { getOption, setOption } from '../options'
import './optionsUI.sass'
import { MAIN_UI_ELEMENT } from './ui'
import { h } from 'dom-chef'

export function OptionsUI() {
  const mainEL = <div className="fixed modal options">
    <div>
      <h1>Options</h1>
      enableMouseAttacks: <input type="checkbox" name="Enable Mouse Attack" checked={getOption('input', 'enableMouseAttacks')} onChange={(e) => {
        setOption('input', 'enableMouseAttacks', e.target.checked)
      }} />
    </div>
    <div>
      <span className="button" onClick={() => {
        mainEL.remove()
      }}>Close</span>
    </div>
  </div>
  // TODO add close options menu keybinding.
  MAIN_UI_ELEMENT.appendChild(mainEL)
}
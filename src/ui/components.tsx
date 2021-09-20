import { h } from 'dom-chef'
import './components.sass'


export function MoneyEl(amount: string | number) {
  return <span className="money">{amount}</span>
}
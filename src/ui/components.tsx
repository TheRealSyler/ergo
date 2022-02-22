import { h } from 'dom-chef'
import './components.sass'

export function MoneyEl(amount: string | number) {
  return <span className="component-money">{amount}</span>
}
export function LevelEl(amount: string | number) {
  return <span className="component-level">{amount}</span>
}

export function StatEl(amount: string | number, positive: boolean) {
  return <span className={`stat ${positive ? 'component-stat-positive' : 'component-stat-negative'}`}>{amount}</span>
}
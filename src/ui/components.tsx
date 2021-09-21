import { h } from 'dom-chef'
import './components.sass'

export function MoneyEl(amount: string | number) {
  return <span className="money">{amount}</span>
}

export function StatEl(amount: string | number, positive: boolean) {
  return <span className={`stat ${positive ? 'stat-positive' : 'stat-negative'}`}>{amount}</span>
}
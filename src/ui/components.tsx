import { h } from 'dom-chef'

export function StatEl(amount: string | number, positive: boolean) {
  return ColorText(amount, positive ? 'StatPos' : 'StatNeg')
}

const TEXT_COLORS = {
  White: '#eee',
  Level: '#0df',
  Money: '#fc4',
  Quest: '#fEa178',
  Town: '#569CD6',
  Skill: '#C586C0',
  StatPos: 'green',
  StatNeg: 'red'
}

export function ColorText(input: string | number, color: keyof typeof TEXT_COLORS) {
  return <span style={{ color: TEXT_COLORS[color] }}>{input}</span>
}

export function JoinSpanEl(a?: string | HTMLElement, b?: string | HTMLElement) {
  return <span>{a} {b}</span>
}

type Options = typeof OPTIONS

export function setOption<T extends keyof Options>(section: T, key: keyof Options[T], value: Options[T][keyof Options[T]]) {
  window.localStorage.setItem(`${section}-${key}`, `${value}`) // TODO add better type conversion system.
  OPTIONS[section][key] = value
}

export function getOption<T extends keyof Options>(section: T, key: keyof Options[T]) {
  return OPTIONS[section][key]
}

const OPTIONS = {
  input: {
    enableMouseAttacks: !!window.localStorage.getItem(`input-enableMouseAttacks`)
  }
}


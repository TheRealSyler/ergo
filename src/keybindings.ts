type Keybindings = typeof KEYBINDINGS

export function getKeybinding<T extends keyof Keybindings>(type: T, name: keyof Keybindings[T]) {
  return KEYBINDINGS[type][name]
}
export function setKeybinding<T extends keyof Keybindings>(type: T, name: keyof Keybindings[T], value: Keybindings[T][keyof Keybindings[T]]) {
  // TODO implement checks etc.
  return KEYBINDINGS[type][name] = value
}

const KEYBINDINGS = {
  Dungeon: {
    MoveForward: 'W',
    MoveLeft: 'A',
    MoveRight: 'D',
    MoveBack: 'S',
    Interact: 'E',
    OpenInventory: 'TAB',
  },
  Fight: {
    // TODO fight keybindings
    AttackLeft: 'ARROWLEFT',
    // Attack
  }
}
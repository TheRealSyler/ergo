type Keybindings = typeof KEYBINDINGS

/**ALWAYS in uppercase */
export function getKeybinding<T extends keyof Keybindings>(type: T, name: keyof Keybindings[T]) {
  return KEYBINDINGS[type][name]
}
export function setKeybinding<T extends keyof Keybindings>(type: T, name: keyof Keybindings[T], value: Keybindings[T][keyof Keybindings[T]]) {
  // TODO implement checks etc.
  return KEYBINDINGS[type][name] = value
}
// TODO write small check that ensure the default values are in upper case.
/**SHOULD ALWAYS be in uppercase */
const KEYBINDINGS = {
  Dungeon: {
    MoveForward: 'W',
    MoveLeft: 'A',
    MoveRight: 'D',
    MoveBack: 'S',
    Interact: 'E',
    ToggleInventory: 'TAB',
  },
  Fight: {
    // TODO fight keybindings
    AttackLeft: 'ARROWLEFT',
    // Attack
  }
}
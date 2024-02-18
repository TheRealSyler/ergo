type Keybindings = typeof KEYBINDINGS

/**ALWAYS in uppercase */
export function getKeybinding<T extends keyof Keybindings>(type: T, name: keyof Keybindings[T]) {
  const keyBinding = KEYBINDINGS[type][name] as unknown as string
  if (keyBinding === 'SPACE') {
    return ' '
  }
  return keyBinding
}

export function getKeybindingUI<T extends keyof Keybindings>(type: T, name: keyof Keybindings[T]) {
  return `[${KEYBINDINGS[type][name]}]`
}
export function setKeybinding<T extends keyof Keybindings>(type: T, name: keyof Keybindings[T], value: Keybindings[T][keyof Keybindings[T]]) {
  // TODO implement checks etc.
  return KEYBINDINGS[type][name] = value
}

/**SHOULD ALWAYS be in uppercase */
const KEYBINDINGS = {
  Dungeon: {
    MoveForward: 'W',
    MoveLeft: 'A',
    MoveRight: 'D',
    MoveBack: 'S',
    Interact: 'E',
    PauseMenu: 'SPACE',
  },
  Fight: {
    // TODO fight keybindings
    AttackLeft: 'ARROWLEFT',
    PauseMenu: 'SPACE'
  },
  Inventory: {
    ToggleInventory: 'TAB',
  },
  Campaign: {
    OpenQuestBoard: 'Q'
  },
  PauseMenu: {
    Options: 'O',
    RestartFight: 'ENTER',
    MenuMain: 'BACKSPACE',
    Resume: 'SPACE',
    Inventory: 'TAB',
    RunFromFight: 'R'
  }
}

function checkDefaultKeybindings(keybindings: Keybindings) {
  for (const sectionKey in keybindings) {
    if (Object.prototype.hasOwnProperty.call(keybindings, sectionKey)) {
      const section = keybindings[sectionKey as keyof Keybindings]
      for (const key in section) {
        if (Object.prototype.hasOwnProperty.call(section, key)) {
          const keybinding = section[key as keyof typeof section] as string
          if (typeof keybinding !== 'string') {
            console.error(`Keybinding [${sectionKey}] -> ${key}: "${keybinding}" is not a string`)
          } else if (keybinding !== keybinding.toUpperCase()) {
            console.warn(`Keybinding [${sectionKey}] -> ${key}: "${keybinding}" is not uppercase, it will be automatically corrected but please change it anyways.`)
            section[key as keyof typeof section] = keybinding.toUpperCase() as never
          }
        }
      }
    }
  }
}

checkDefaultKeybindings(KEYBINDINGS)
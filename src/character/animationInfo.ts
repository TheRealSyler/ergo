import { Character } from './character';
import { ITEMS } from './items';

import glib_animations from '../assets/glib/glib_animations.glb';

export function getCharacterAnimationInfo(character: Character) {
  if (character.items.weapon) {
    const weapon = ITEMS[character.items.weapon];
    if (weapon.type === 'weapon') {
      switch (weapon.weaponHands) {
        case 'double':
        case 'single':
        // TODO change animation based on weapon type.
      }
    }
  }
  return glib_animations
}

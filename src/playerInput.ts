import { AttackAnimations, DodgeAnimations } from './animation/types';

type InputKeys = (AttackAnimations | DodgeAnimations);

export interface Input {
  keys: { [key in InputKeys]: boolean };
  dispose: () => void;
}
export class PlayerInput implements Input {
  keys: Input['keys'] = {
    attack_right: false,
    attack_left: false,
    attack_up: false,
    attack_down: false,
    dodge_left: false,
    dodge_right: false
  };

  constructor() {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }
  dispose() {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }
  private onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
        this.keys.attack_right = true;
        break;
      case 'ArrowLeft':
        this.keys.attack_left = true;
        break;
      case 'ArrowUp':
        this.keys.attack_up = true;
        break;
      case 'ArrowDown':
        this.keys.attack_down = true;
        break;
      case 'a':
      case 'A':
        this.keys.dodge_left = true;
        break;
      case 'd':
      case 'D':
        this.keys.dodge_right = true;
        break;
    }
  }

  private onKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
        this.keys.attack_right = false;
        break;
      case 'ArrowLeft':
        this.keys.attack_left = false;
        break;
      case 'ArrowUp':
        this.keys.attack_up = false;
        break;
      case 'ArrowDown':
        this.keys.attack_down = false;
        break;
      case 'a':
      case 'A':
        this.keys.dodge_left = false;
        break;
      case 'd':
      case 'D':
        this.keys.dodge_right = false;
        break;
    }
  }
};
import { AttackAnimations, DodgeAnimations } from './animation/types';
import { MAIN_UI_ELEMENT } from './ui/ui';

type InputKeys = (AttackAnimations | DodgeAnimations);

export interface Input {
  keys: { [key in InputKeys]: boolean };
  pause: () => void;
  unpause: () => void;
  dispose: () => void;
}

export const EMPTY_INPUT: Input = {
  dispose: () => { },
  pause: () => { },
  unpause: () => { },
  keys: {
    attack_right: false,
    attack_left: false,
    attack_up: false,
    attack_down: false,
    dodge_left: false,
    dodge_right: false
  }
}

Object.freeze(EMPTY_INPUT)
Object.freeze(EMPTY_INPUT.keys)

export class PlayerInput implements Input {
  keys = { ...EMPTY_INPUT.keys };

  private enableMouseAttacks = true
  constructor() {
    this.addListeners();
  }

  private addListeners() {
    document.addEventListener('keydown', this.keydown);
    document.addEventListener('keyup', this.keyup);
    if (this.enableMouseAttacks) {
      document.addEventListener('mouseup', this.mouseup);
      document.addEventListener('mousedown', this.mousedown);
      document.addEventListener('mousemove', this.mousemove);
    }
  }

  unpause() { this.addListeners() }
  pause() { this.dispose() }

  dispose() {
    document.removeEventListener('keydown', this.keydown)
    document.removeEventListener('keyup', this.keyup)
    document.removeEventListener('mouseup', this.mouseup)
    document.removeEventListener('mousedown', this.mousedown)
    document.removeEventListener('mousemove', this.mousemove)
    document.exitPointerLock()
  }
  private keydown = (event: KeyboardEvent) => {
    // TODO add keybindings
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

  private keyup = (event: KeyboardEvent) => {
    // TODO add keybindings
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
  private mousePos = { x: 0, y: 0 }
  private startPos?: { x: number, y: number }
  private mouseup = (e: MouseEvent) => {
    if (this.startPos) {
      const x = this.startPos.x - this.mousePos.x
      const y = this.startPos.y - this.mousePos.y

      if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) {
          this.keys.attack_left = true
          setTimeout(() => {
            this.keys.attack_left = false
          }, 50);
        } else {
          this.keys.attack_right = true
          setTimeout(() => {
            this.keys.attack_right = false
          }, 50);
        }
      } else {
        if (y > 0) {
          this.keys.attack_up = true
          setTimeout(() => {
            this.keys.attack_up = false
          }, 50);
        } else {
          this.keys.attack_down = true
          setTimeout(() => {
            this.keys.attack_down = false
          }, 50);
        }
      }
    }
  };
  private mousedown = (e: MouseEvent) => {
    if (!document.pointerLockElement) {
      MAIN_UI_ELEMENT.requestPointerLock()
    }
    this.startPos = { ...this.mousePos }

  };
  private mousemove = (e: MouseEvent) => {

    this.mousePos.x += e.movementX
    this.mousePos.y += e.movementY

  };
};
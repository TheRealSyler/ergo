import { AttackAnimations, BlockAnimations, DodgeAnimations } from './animation/types';
import { getOption } from './options';
import { MAIN_UI_ELEMENT } from './ui/ui';

type InputKeys = (AttackAnimations | DodgeAnimations | BlockAnimations);

export interface Input {
  keys: { [key in InputKeys]: boolean };
  aiBlockDirection?: BlockAnimations
  aiSuccessfullyBlocked?: boolean
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
    dodge_right: false,
    block_down: false,
    block_left: false,
    block_right: false,
    block_up: false
  }
}

Object.freeze(EMPTY_INPUT)
Object.freeze(EMPTY_INPUT.keys)

export class PlayerInput implements Input {
  keys = { ...EMPTY_INPUT.keys };

  constructor() {
    this.addListeners();
  }

  private addListeners() {
    document.addEventListener('keydown', this.keydown);
    document.addEventListener('keyup', this.keyup);

    document.addEventListener('mouseup', this.mouseup);
    document.addEventListener('mousedown', this.mousedown);
    document.addEventListener('mousemove', this.mousemove);

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
  private keydown = (e: KeyboardEvent) => {
    // TODO add keybindings
    switch (e.key) {
      case 'ArrowRight':
        if (e.shiftKey) {
          this.keys.block_right = true;
          break
        }
        this.keys.attack_right = true;
        break;
      case 'ArrowLeft':
        if (e.shiftKey) {
          this.keys.block_left = true;
          break
        }
        this.keys.attack_left = true;
        break;
      case 'ArrowUp':
        if (e.shiftKey) {
          this.keys.block_up = true;
          break
        }
        this.keys.attack_up = true;
        break;
      case 'ArrowDown':
        if (e.shiftKey) {
          this.keys.block_down = true;
          break
        }
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
        this.keys.block_right = false;
        break;
      case 'ArrowLeft':
        this.keys.attack_left = false;
        this.keys.block_left = false
        break;
      case 'ArrowUp':
        this.keys.attack_up = false;
        this.keys.block_up = false
        break;
      case 'ArrowDown':
        this.keys.attack_down = false;
        this.keys.block_down = false
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

  private mouseup = () => {
    if (getOption('input', 'enableMouseAttacks') && this.startPos) {
      const x = this.startPos.x - this.mousePos.x
      const y = this.startPos.y - this.mousePos.y

      if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) {
          this.setKeyWithWithTimer('attack_left');
        } else {
          this.setKeyWithWithTimer('attack_right');;
        }
      } else {
        if (y > 0) {
          this.setKeyWithWithTimer('attack_up');
        } else {
          this.setKeyWithWithTimer('attack_down');
        }
      }
    }
  };

  private mousedown = (e: MouseEvent) => {
    if (getOption('input', 'enableMouseAttacks')) {
      if (!document.pointerLockElement) {
        MAIN_UI_ELEMENT.requestPointerLock()
      }
      this.startPos = { ...this.mousePos }
    }
  };

  private mousemove = (e: MouseEvent) => {
    if (getOption('input', 'enableMouseAttacks')) {
      this.mousePos.x += e.movementX
      this.mousePos.y += e.movementY
    }

  };

  private setKeyWithWithTimer(key: keyof Input['keys']) {
    this.keys[key] = true;
    setTimeout(() => {
      this.keys[key] = false;
    }, 50);
  }
};
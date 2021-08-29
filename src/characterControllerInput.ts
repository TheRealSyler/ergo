export interface Input {
  keys: {
    attack_right: boolean;
    attack_left: boolean;
    dodge_down: boolean;
    dodge_left: boolean;
    dodge_right: boolean;
  };

}

export class CharacterControllerInput implements Input {
  keys: Input['keys'] = {
    attack_right: false,
    attack_left: false,
    dodge_down: false,
    dodge_left: false,
    dodge_right: false
  };

  constructor() {
    document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
  }

  private onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
        this.keys.attack_right = true;
        break;
      case 'ArrowLeft':
        this.keys.attack_left = true;
        break;
      case 's':
      case 'S':
        this.keys.dodge_down = true;
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

  private onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
        this.keys.attack_right = false;
        break;
      case 'ArrowLeft':
        this.keys.attack_left = false;
        break;
      case 's':
      case 'S':
        this.keys.dodge_down = false;
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
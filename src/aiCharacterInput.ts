import { Input } from './characterControllerInput';


export class AiCharacterControllerInput implements Input {
  keys: Input['keys'] = {
    attack_right: false,
    attack_left: false,
    attack_up: false,
    attack_down: false,
    dodge_down: false,
    dodge_left: false,
    dodge_right: false
  };

  constructor() {
    this.attack()
  }
  attack() {
    setTimeout(() => {
      const a: keyof Input['keys'] = ['attack_left', 'attack_right'][Math.floor(Math.random() * 2)] as any;
      this.keys[a] = true;
      setTimeout(() => {

        this.keys[a] = false;
      }, 40);
      this.attack()
    }, 1000 + Math.random() * 1000);
  }
  randomDodge() {
    const a: keyof Input['keys'] = ['dodge_down', 'dodge_left', 'dodge_right'][Math.floor(Math.random() * 3)] as any;
    setTimeout(() => {
      this.keys[a] = true
      setTimeout(() => {
        this.keys[a] = false
        this.randomDodge()
      }, 200 + Math.random() * 1000);
    }, 200 + Math.random() * 1000);
  }

};
import { Character } from './character/character';
import { FightController } from './fight/fightController';
import { LoadFight } from './fight/loadFight';
import { UiMainMenu } from './ui/mainMenuUI';

export type Player = 'player1' | 'player2'

export class Game {
  mainMenu?: UiMainMenu;
  fightController?: FightController;

  startInFight = true

  constructor() {
    if (this.startInFight) {
      this.goToFight()
    } else {
      this.goToMainMenu()
    }
  }
  goToMainMenu() {
    this.fightController = undefined;
    this.mainMenu = new UiMainMenu(this.goToFight.bind(this))
  }

  async goToFight(player1?: Character, player2?: Character) {
    this.mainMenu = undefined;
    this.fightController = await LoadFight('player1', this, player1 || { class: 'base', items: {} }, player2 || { class: 'base', items: {} });
  }

}

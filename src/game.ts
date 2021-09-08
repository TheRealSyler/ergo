import { FightController } from './fightController';
import { LoadFight } from './loadFight';
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

  async goToFight() {
    this.mainMenu = undefined;
    this.fightController = await LoadFight('player1', this);
  }

}

import { FightController } from './fightController';
import { UiMainMenu } from './ui/uiMainMenu';

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

  goToFight() {
    this.mainMenu = undefined;
    this.fightController = new FightController(this)
  }

}

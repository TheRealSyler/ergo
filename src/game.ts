import { Character } from './character/character';
import { FightController } from './fight/fightController';
import { LoadFight } from './fight/loadFight';
import { CustomBattleUI } from './ui/customBattleUI';
import { UiMainMenu } from './ui/mainMenuUI';

export type Player = 'player1' | 'player2'

export class Game {
  fightController?: FightController;

  startInFight = false

  constructor() {
    if (this.startInFight) {
      this.goToFight()
    } else {
      this.goToMainMenu()
    }
  }
  goToMainMenu() {
    this.fightController = undefined;
    CustomBattleUI(this.goToFight.bind(this))
  }

  async goToFight(humanPlayer?: Player, player1?: Character, player2?: Character) {
    this.fightController = await LoadFight(humanPlayer || 'player1', this, player1 || { class: 'base', items: {} }, player2 || { class: 'base', items: {} });
  }

}

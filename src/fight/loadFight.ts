import { LoadingManager } from 'three';
import { loadCharacter } from '../character/loadCharacter';

import { Game, Player } from '../game';
import { CharacterController } from '../character/characterController';
import { FightUI } from '../ui/fightUI';
import { LoaderUI } from '../ui/loaderUI';
import { Character } from '../character/character';
import { loadRoom, RoomNames } from '../rooms/rooms';
import { getGLTFLoader } from '../utils';
import { FightControllerStandalone } from './fightControllerStandalone';

export async function LoadFight(humanPlayer: Player, game: Game, player1: Character, player2: Character, stageName: RoomNames): Promise<FightControllerStandalone> {
  const manager = new LoadingManager()
  LoaderUI(manager, 'Loading Custom Battle')
  return new Promise(async (res) => {

    const loader = getGLTFLoader(manager);

    const [playerChar1, playerChar2, room] = await Promise.all([loadCharacter(loader, player1), loadCharacter(loader, player2), loadRoom(stageName, manager, loader)])

    const ui = new FightUI()

    const players: Record<Player, CharacterController> = {
      player1: new CharacterController('player1', ui, playerChar1),
      player2: new CharacterController('player2', ui, playerChar2)
    }

    res(new FightControllerStandalone(game.goToMainMenu.bind(game), players, ui, humanPlayer, room))

  })

}


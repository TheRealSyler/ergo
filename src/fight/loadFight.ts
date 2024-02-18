import { LoadingManager } from 'three'
import type { Character } from '../character/character'
import { CharacterController } from '../character/characterController'
import { loadCharacter } from '../character/loadCharacter'
import type { Game, Player } from '../game'
import { loadRoom, type RoomNames } from '../rooms/rooms'
import { FightUI } from '../ui/fightUI'
import { LoaderUI } from '../ui/loaderUI'
import { getGLTFLoader } from '../utils'
import { FightControllerStandalone } from './fightControllerStandalone'

export async function LoadFight(humanPlayer: Player, game: Game, player1: Character, player2: Character, stageName: RoomNames): Promise<FightControllerStandalone> {
  const manager = new LoadingManager()
  LoaderUI(manager, 'Loading Custom Battle')
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (res) => {

    const loader = getGLTFLoader(manager)

    const [playerChar1, playerChar2, room] = await Promise.all([loadCharacter(loader, player1), loadCharacter(loader, player2), loadRoom(stageName, manager, loader)])

    const ui = new FightUI()

    const players: Record<Player, CharacterController> = {
      player1: new CharacterController('player1', ui, playerChar1),
      player2: new CharacterController('player2', ui, playerChar2)
    }

    res(new FightControllerStandalone(game.goToMainMenu.bind(game), players, ui, humanPlayer, room))

  })

}


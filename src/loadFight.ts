import { LoadingManager } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { loadCharacter, LoadedCharacterFunc } from './character/loadCharacter';

import { Game, Player } from './game';
import { CharacterController } from './characterController';
import { FightUI } from './ui/fightUI';
import { FightController } from './fightController';
import { LoaderUI } from './ui/loaderUI';
import { Character } from './character/character';

export async function LoadFight(humanPlayer: Player, game: Game, player1: Character, player2: Character): Promise<FightController> {
  LoaderUI()
  return new Promise((res) => {

    const playerCharacters: Record<Player, undefined | LoadedCharacterFunc> = {
      player1: undefined,
      player2: undefined
    }

    const manager = new LoadingManager()

    const loader = new GLTFLoader(manager);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    playerCharacters.player1 = loadCharacter(loader, player1)
    playerCharacters.player2 = loadCharacter(loader, player2)

    manager.onLoad = () => {
      if (playerCharacters.player1 && playerCharacters.player2) {
        const ui = new FightUI()

        const createdChar1 = playerCharacters.player1()
        const createdChar2 = playerCharacters.player2()

        const players: Record<Player, CharacterController> = {
          player1: new CharacterController('player1', ui, createdChar1),
          player2: new CharacterController('player2', ui, createdChar2)
        }

        res(new FightController(game, players, ui, humanPlayer))
      }

    }
  })

}
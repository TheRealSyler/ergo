import { CharacterController } from '../character/characterController';
import { Player } from '../game';
import { FightUI } from '../ui/fightUI';
import { Room } from '../rooms/rooms';
import { Renderer } from '../renderer';
import { FightController } from './fightController';

export class FightControllerStandalone extends Renderer {
  con: FightController;
  constructor(private exitFunc: () => void, players: Record<Player, CharacterController>, ui: FightUI, humanPlayer: Player, room: Room) {
    super();
    this.scene.add(room.scene);

    this.scene.environment = room.background;
    // TODO research this RoughnessMipmapper thing.
    // the code is from https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_gltf.html
    // const roughnessMipmapper = new RoughnessMipmapper(this.renderer);
    // this.scene.traverse(function (child) {
    //   // @ts-ignore
    //   if (child.isMesh) {
    //     // @ts-ignore
    //     roughnessMipmapper.generateMipmaps(child.material);
    //   }
    // });
    // roughnessMipmapper.dispose();
    this.scene.add(players.player1.model);
    this.scene.add(players.player2.model);

    this.con = new FightController(this.exit.bind(this), players, ui, humanPlayer, this);
  }

  private exit() {
    this.disposeRenderer();
    this.exitFunc();
  }

  protected update(delta: number) {
    this.con.update((delta - this.previousRAF) * 0.001);
  }
}

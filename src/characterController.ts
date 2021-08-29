import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer, Group, Scene } from 'three';
import glib from './assets/glib.glb';
import { error } from './utils';
import { AttackState } from "./states/attackState";
import { DodgeState } from "./states/dodgeState";
import { IdleState } from "./states/idleState";
import { FiniteStateMachine } from "./states/finiteStateMachine";
import { Input, CharacterControllerInput } from './characterControllerInput';
import { Animations, AnimationTypes } from './states/types';


export class CharacterController {
  animations: Animations<AnimationTypes> = {};
  stateMachine: FiniteStateMachine<AnimationTypes>;
  target?: Group;
  mixer?: AnimationMixer;
  constructor(public scene: Scene, public input: Input = new CharacterControllerInput()) {

    this.stateMachine = new FiniteStateMachine({
      attack_left: new AttackState('attack_left', this.animations),
      attack_right: new AttackState('attack_right', this.animations),
      dodge_left: new DodgeState('dodge_left', 'dodge_left', this.input, this.animations),
      dodge_right: new DodgeState('dodge_right', 'dodge_right', this.input, this.animations),
      dodge_down: new DodgeState('dodge_down', 'dodge_down', this.input, this.animations),
      idle: new IdleState(this.input, this.animations)
    });

    const loader = new GLTFLoader();
    loader.load(glib, (gltf) => {
      this.target = gltf.scene;
      this.target.scale.setScalar(10);
      this.scene.add(this.target);

      this.mixer = new AnimationMixer(this.target);

      this.addAnimation('idle', gltf);
      this.addAnimation('attack_left', gltf);
      this.addAnimation('attack_right', gltf);
      this.addAnimation('dodge_left', gltf);
      this.addAnimation('dodge_down', gltf);
      this.addAnimation('dodge_right', gltf);

      this.stateMachine.SetState('idle');
    });

  }

  private addAnimation(animName: AnimationTypes, anim: GLTF) {
    const clip = anim.animations.find(a => a.name === animName);
    if (this.mixer && clip) {
      const action = this.mixer.clipAction(clip);

      this.animations[animName] = {
        clip: clip,
        action: action,
      };
    } else {
      error(`Could not load animation: ${animName}`, 'CharacterController');
    }
  };

  Update(timeInSeconds: number) {
    if (!this.target) {
      return;
    }

    this.stateMachine.Update(timeInSeconds);

    if (this.mixer) {
      this.mixer.update(timeInSeconds);
    }
  }
}
;

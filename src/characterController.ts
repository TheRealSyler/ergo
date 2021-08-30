import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer, Bone, Group, PerspectiveCamera, Scene, SkeletonHelper } from 'three';
import glib from './assets/glib.glb';
import { error } from './utils';
import { AttackState } from "./states/attackState";
import { DodgeState } from "./states/dodgeState";
import { IdleState } from "./states/idleState";
import { FiniteStateMachine } from "./states/finiteStateMachine";
import { Input, CharacterControllerInput } from './characterControllerInput';
import { Animations, AnimationTypes, AttackAnimations, DodgeAnimations } from './states/types';
import { degToRad } from 'three/src/math/MathUtils';

export type CharStance = DodgeStance | AttackStance | IdleStance

export interface DodgeStance {
  type: 'dodge',
  dodgeProgress: 'started' | 'evaded',
  dodgeDirection: DodgeAnimations
}

export interface AttackStance {
  type: 'attack',
  attackProgress: 'started' | 'active' | 'hit',
  attackDirection: AttackAnimations
}
export interface IdleStance {
  type: 'idle'
}

export class CharacterController {
  animations: Animations<AnimationTypes> = {};
  stateMachine: FiniteStateMachine<AnimationTypes>;
  charMesh?: Group;
  mixer?: AnimationMixer;
  head?: Bone;
  base = new Group();

  stance: CharStance = { type: 'idle' };

  constructor(public scene: Scene, public camera: PerspectiveCamera, public input: Input = new CharacterControllerInput(), private attachCamera = false) {

    this.stateMachine = new FiniteStateMachine({
      attack_left: new AttackState('attack_left', this),
      attack_right: new AttackState('attack_right', this),
      attack_up: new AttackState('attack_right', this), // TODO change animation to attack up
      attack_down: new AttackState('attack_right', this), // TODO change animation to attack down
      dodge_left: new DodgeState('dodge_left', 'dodge_left', this),
      dodge_right: new DodgeState('dodge_right', 'dodge_right', this),
      dodge_down: new DodgeState('dodge_down', 'dodge_down', this),
      idle: new IdleState(this.input, this)
    });
    this.scene.add(this.base);
    const loader = new GLTFLoader();
    loader.load(glib, (gltf) => {
      this.charMesh = gltf.scene;
      this.base.add(this.charMesh);

      const skeleton = new SkeletonHelper(this.charMesh);
      skeleton.visible = false;
      this.head = skeleton.bones.find((bone) => bone.name === 'head');
      if (this.head && this.attachCamera) {
        this.head.add(this.camera);
        this.camera.rotateY(degToRad(180));
      }
      this.mixer = new AnimationMixer(this.charMesh);

      this.addAnimation('idle', gltf);
      // TODO change animation to attack up
      // TODO change animation to attack down
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
    if (!this.charMesh) {
      return;
    }

    this.stateMachine.Update(timeInSeconds);

    if (this.mixer) {
      this.mixer.update(timeInSeconds);
    }

  }
}
;

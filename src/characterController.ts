import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer, Bone, Group, LoadingManager, PerspectiveCamera, Scene, SkeletonHelper } from 'three';
import glib_model from './assets/glib/glib_model.glb';
import glib_animations from './assets/glib/glib_animations.glb';
import { error, NumberRange } from './utils';
import { AttackState } from "./animation/attackState";
import { DodgeState } from "./animation/dodgeState";
import { IdleState } from "./animation/idleState";
import { FiniteStateMachine } from "./finiteStateMachine";
import { Input, PlayerInput } from './playerInput';
import { Animations, AnimationTypes, AttackAnimations, DodgeAnimations } from './animation/types';
import { degToRad } from 'three/src/math/MathUtils';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { AiCharacterControllerInput } from './ai/aiCharacterInput';
import { HitState } from './animation/hitState';

export type CharStance = DodgeStance | AttackStance | IdleStance | HitStance

export interface DodgeStance {
  type: 'dodge',
  dodgeProgress: 'started' | 'evaded',
  dodgeDirection: DodgeAnimations
}

export interface AttackStance {
  type: 'attack',
  attackProgress: 'started' | 'active' | 'hit' | 'finished',
  attackDirection: AttackAnimations
}
export interface IdleStance {
  type: 'idle'
}
export interface HitStance {
  type: 'hit'
}
// TODO rename this.
type HealthOrStamina = {
  max: number;
  current: number;
};


export interface CharStats {
  /** The time the ai does nothing/waits for the player to attack. */
  aiTimeToAttack: NumberRange
  /**The time it takes for the ai to react to the player attack. */
  aiDodgeReactionTime: NumberRange
  /**The attack animation speed. */
  attackSpeed: number
  /**The time it takes to go from idle to dodge state. */
  dodgeSpeed: number
  /** The hit animation speed. */
  hitTime: number

  /**Stamina Regeneration Per second */
  staminaRegenRate: number

  attackStaminaCost: number

  damage: number

  health: HealthOrStamina
  stamina: HealthOrStamina
}

export class CharacterController {
  animations: Animations<AnimationTypes> = {};
  stateMachine: FiniteStateMachine<AnimationTypes>;
  charMesh?: Group;
  mixer?: AnimationMixer;
  head?: Bone;
  base = new Group();


  stats: CharStats = {
    aiDodgeReactionTime: new NumberRange(0.1, 0.8),
    aiTimeToAttack: new NumberRange(1, 2.5),
    attackSpeed: 1,
    dodgeSpeed: 0.3,
    hitTime: 1.5,
    staminaRegenRate: 5,
    attackStaminaCost: 50,
    damage: 55,
    health: {
      current: 100,
      max: 100
    },
    stamina: {
      current: 100,
      max: 100
    },
  }

  public get hp(): number {
    return this.stats.health.current
  }
  public set hp(v: number) {
    this.stats.health.current = v;
  }
  public get stamina(): number {
    return this.stats.stamina.current
  }

  public set stamina(v: number) {
    this.stats.stamina.current = v;
  }

  stance: CharStance = { type: 'idle' };
  input: Input;

  constructor(public scene: Scene, public camera: PerspectiveCamera, /**If provided it's assumed that this is an ai char controller.*/isAi?: CharacterController, private attachCamera = false) {

    if (isAi) {
      this.input = new AiCharacterControllerInput(this, isAi)
    } else {
      this.input = new PlayerInput()
    }

    this.stateMachine = new FiniteStateMachine({
      attack_left: new AttackState('attack_left', this),
      attack_right: new AttackState('attack_right', this),
      attack_up: new AttackState('attack_up', this),
      attack_down: new AttackState('attack_down', this),
      dodge_left: new DodgeState('dodge_left', 'dodge_left', this),
      dodge_right: new DodgeState('dodge_right', 'dodge_right', this),
      idle: new IdleState(this),
      hit: new HitState(this)
    });
    this.scene.add(this.base);

    this.loadMesh();
  }

  dispose() {
    this.input.dispose();
    this.scene.remove(this.base)
  }

  private loadMesh() {
    let animations: GLTF | undefined;
    const manager = new LoadingManager(() => {
      if (this.charMesh && animations) {

        this.mixer = new AnimationMixer(this.charMesh);

        this.addAnimation('idle', animations);
        this.addAnimation('hit', animations);
        this.addAnimation('attack_up', animations);
        this.addAnimation('attack_down', animations);
        this.addAnimation('attack_left', animations);
        this.addAnimation('attack_right', animations);
        this.addAnimation('dodge_left', animations);
        this.addAnimation('dodge_right', animations);

        this.stateMachine.SetState('idle');
      } else {
        error('Could not load character (TODO?, add better info)', CharacterController.name);
      }
    });

    const loader = new GLTFLoader(manager);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/');
    loader.setDRACOLoader(dracoLoader);
    loader.load(glib_model, (gltf) => {
      this.charMesh = gltf.scene;
      this.base.add(this.charMesh);

      const skeleton = new SkeletonHelper(this.charMesh);
      skeleton.visible = false;
      this.head = skeleton.bones.find((bone) => bone.name === 'head');
      if (this.head && this.attachCamera) {
        this.head.add(this.camera);
        this.camera.rotateY(degToRad(180));
      }

    });

    loader.load(glib_animations, (gltf) => {
      animations = gltf;
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
      error(`Could not load animation: ${animName}`, CharacterController.name);
    }
  };

  Update(timeInSeconds: number) {
    if (!this.charMesh) {
      return;
    }

    this.stateMachine.Update(timeInSeconds);
    if (this.input instanceof AiCharacterControllerInput) {
      this.input.update(timeInSeconds)
    }
    if (this.mixer) {
      this.mixer.update(timeInSeconds);
    }

    if (this.stance.type === 'idle' && this.stamina < this.stats.stamina.max) {
      this.stamina = Math.min(this.stamina + this.stats.staminaRegenRate * timeInSeconds, this.stats.stamina.max)
    }

  }
}
;

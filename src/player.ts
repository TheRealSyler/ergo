import { AnimationAction, AnimationMixer, AnimationUtils, Bone, BoxGeometry, Group, LoopOnce, Mesh, MeshBasicMaterial, Scene, SkeletonHelper, Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { Timer, loader, camera, timers } from './old';
import glib from './assets/glib.glb';

export type PlayerStance = 'idle' | 'dodge_left' | 'dodge_right' | 'dodge_down';
export type PlayerAttack = 'attack_left' | 'attack_right' | 'attack_up' | 'attack_down'

export class Player {
  stance: PlayerStance = 'idle';
  animation: null | Timer = null;
  animationTime = 100;
  base = new Group();
  weapon: Mesh;
  mixer?: AnimationMixer;
  head?: Bone;

  allActions: AnimationAction[] = [];

  constructor(scene: Scene, startPosition: Vector3, r = false) {


    const wMaterial = new MeshBasicMaterial({ color: 0xff4a4a });
    const wGeo = new BoxGeometry();

    this.weapon = new Mesh(wGeo, wMaterial);
    this.weapon.position.set(startPosition.x + 1, startPosition.y, startPosition.z);
    this.weapon.scale.setScalar(0.4);
    this.base.add(this.weapon);




    loader.load(glib, (gltf) => {

      const model = gltf.scene;
      this.base.add(model);

      model.traverse((object) => {
        // @ts-ignore TODO remove this comment
        if (object.isMesh)
          object.castShadow = true;
      });

      const skeleton = new SkeletonHelper(model);
      skeleton.visible = false;

      this.head = skeleton.bones.find((bone) => bone.name === 'head');
      console.log(this.head, skeleton.bones)
      if (this.head && r) {
        this.head.add(camera);
        camera.rotateY(degToRad(180));

      }

      this.base.add(skeleton);

      const animations = gltf.animations;
      console.log(animations)
      this.mixer = new AnimationMixer(model);
      for (let i = 0; i !== animations.length; ++i) {

        let clip = animations[i];
        if (clip.name.startsWith('attack')) {
          // AnimationUtils.makeClipAdditive(clip);
        }

        const action = this.mixer.clipAction(clip);
        this.activateAction(action);

        this.allActions.push(action);

      }
      this.mixer.timeScale = 0.5;
    });



    this.base.position.set(startPosition.x, startPosition.y, startPosition.z);
    scene.add(this.base);
    if (r)
      this.base.rotateY(degToRad(180));

  }


  attack(attack: PlayerAttack) {



    // if (this.animation) {
    //   timers.delete(this.animation);
    // }

    const time = this.stance === 'idle' ? this.animationTime : this.animationTime * 2;
    const newAction = this.allActions.find(action => action.getClip().name === attack);
    const oldAction = this.allActions.find(action => action.getClip().name === this.stance);
    newAction?.reset();
    newAction?.setLoop(LoopOnce, 0);
    newAction?.play()

    newAction?.setEffectiveWeight(1);
    // const timer: Timer = {
    //   date: performance.now(),
    //   tick: (elapsed) => {
    //     const percent = elapsed / time;
    //     newAction?.setEffectiveWeight(1 - percent);
    //     oldAction?.setEffectiveWeight(percent);

    //   },
    //   end: () => {
    //     this.animation = null;
    //   },
    //   time: time
    // };
    // timers.add(timer);
    // this.animation = timer;



  }

  changeStance(newStance: PlayerStance) {
    if (this.animation) {
      timers.delete(this.animation);
    }

    const time = this.stance === 'idle' ? this.animationTime : this.animationTime * 2;
    const newAction = this.allActions.find(action => action.getClip().name === newStance);
    const oldAction = this.allActions.find(action => action.getClip().name === this.stance);

    // @ts-ignore TODO
    // this.executeCrossFade(oldAction, newAction, 0.1)

    const timer: Timer = {
      date: performance.now(),
      tick: (elapsed) => {
        const percent = elapsed / time;
        newAction?.setEffectiveWeight(this.stance === newStance ? 1 - percent : percent);
        oldAction?.setEffectiveWeight(this.stance === newStance ? percent : 1 - percent);

      },
      end: () => {
        this.stance = newStance;
        this.animation = null;
      },
      time: time
    };
    timers.add(timer);
    this.animation = timer;
  }

  private activateAction(action: AnimationAction) {
    const clip = action.getClip();

    this.setWeight(action, clip.name === 'idle' ? 1 : 0);
    action.play();

  }

  private setWeight(action: AnimationAction, weight: number) {

    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);

  }

}

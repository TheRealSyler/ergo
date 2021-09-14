import { SkinnedMesh, AnimationMixer, Group } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Animations, AnimationTypes } from '../animation/types';
import { error } from '../utils';
import { getCharacterAnimationInfo } from './animationInfo';
import { Character } from './character';
import { ITEM_MODEL_INFO } from './itemModelInfo';
import { CLASS_MODEL_INFO } from './classModelInfo';

export interface ModelLocation {
  /**webpack import location. */
  location: string,
}
export interface ModelInfo extends ModelLocation {
  /**mesh name in blender */
  name: string
}

export type LoadedCharacter = {
  mixer: AnimationMixer;
  animations: Animations<AnimationTypes>;
  model: Group;
  character: Character;
};

export async function loadCharacter(loader: GLTFLoader, character: Character): Promise<LoadedCharacter> {


  const mainModelInfo = CLASS_MODEL_INFO[character.class]

  const itemPromises: Promise<{ group: Group, info: ModelInfo }>[] = []
  for (const key in character.items) {
    if (Object.prototype.hasOwnProperty.call(character.items, key)) {
      const item = character.items[key as keyof Character['items']];
      if (item) {
        const info = ITEM_MODEL_INFO[item];
        itemPromises.push(new Promise((res, rej) => {
          loader.load(info.location, (gltf) => {
            res({
              group: gltf.scene,
              info,
            })
          }, () => rej())
        }))
      }
    }
  }
  const [main, animationsMesh, loadedItems] = await Promise.all([loader.loadAsync(mainModelInfo.location), loader.loadAsync(getCharacterAnimationInfo(character).location), Promise.all(itemPromises)]);

  const mainModel = main.scene

  // TODO validate that the meshes have been loaded.

  const model = new Group()
  const mainModelMesh = mainModel.getObjectByName(mainModelInfo.name) as any as SkinnedMesh
  let sharedSkeleton = mainModelMesh.skeleton
  // mainModelMesh.castShadow = true
  // mainModelMesh.receiveShadow = true

  for (let i = 0; i < loadedItems.length; i++) {
    const item = loadedItems[i];
    const itemMesh = item.group.getObjectByName(item.info.name) as any as SkinnedMesh
    itemMesh.bind(sharedSkeleton, itemMesh.matrixWorld);
    // itemMesh.castShadow = true
    // itemMesh.receiveShadow = true
    model.add(itemMesh)
  }

  model.add(mainModel);

  const mixer = new AnimationMixer(mainModelMesh);

  const animations: Animations<AnimationTypes> = {
    attack_down: addAndValidateAnimation('attack_down', animationsMesh, mixer)!,
    attack_left: addAndValidateAnimation('attack_left', animationsMesh, mixer)!,
    attack_right: addAndValidateAnimation('attack_right', animationsMesh, mixer)!,
    attack_up: addAndValidateAnimation('attack_up', animationsMesh, mixer)!,
    death: addAndValidateAnimation('death', animationsMesh, mixer)!,
    dodge_left: addAndValidateAnimation('dodge_left', animationsMesh, mixer)!,
    dodge_right: addAndValidateAnimation('dodge_right', animationsMesh, mixer)!,
    hit: addAndValidateAnimation('hit', animationsMesh, mixer)!,
    idle: addAndValidateAnimation('idle', animationsMesh, mixer)!,
    victory: addAndValidateAnimation('idle', animationsMesh, mixer)!, // TODO add victory animations.
  }

  return {
    mixer,
    animations: animations,
    model,
    character
  }

}

function addAndValidateAnimation(animName: AnimationTypes, anim: GLTF, mixer: AnimationMixer) {
  const clip = anim.animations.find(a => a.name === animName);
  if (mixer && clip) {
    const action = mixer.clipAction(clip);
    const duration = action.getClip().duration;

    if (duration < 1) {
      error(`
READ ALL OF THIS
the animation "${animName}" is not 1 second long,
make sure to add any keyframe at frame 24.`, addAndValidateAnimation.name)
    } else if (duration > 1) {
      error(`
READ ALL OF THIS
the animation "${animName}" is over 1 second long,
make sure the blender frame rate is set to 24 and that the frame range is set from 0 to 24 in the blender timeline, and that there are no keyframes outside that range.`, addAndValidateAnimation.name)

    }
    return {
      clip: clip,
      action: action,
    };
  } else {
    error(`Could not load animation: ${animName}`, addAndValidateAnimation.name);
  }
};
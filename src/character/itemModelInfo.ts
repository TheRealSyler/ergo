import { ModelInfo } from './loadCharacter';
import { ItemName } from './items';

import base_glove from '../assets/base/base_glove.glb';
import base_sword from '../assets/items/weapons/base_weapon.glb';

export const ITEM_MODEL_INFO: Record<ItemName, ModelInfo> = {
  BasicGloves: {
    location: base_glove,
    name: 'glove'
  },
  BasicSword: {
    location: base_sword,
    name: 'sword'
  }
}

import { ModelInfo } from './loadCharacter';
import { ItemName } from './items';

import base_glove from '../assets/items/gloves/base_glove.glb';
import base_sword from '../assets/items/weapons/base_weapon.glb';
import base_armor from '../assets/items/armor/base_armor.glb';

export const ITEM_MODEL_INFO: Record<ItemName, ModelInfo> = {
  BasicGloves: {
    location: base_glove,
    name: 'glove'
  },
  SuperGloves: {
    location: base_glove,
    name: 'glove'
  },
  BasicSword: {
    location: base_sword,
    name: 'sword'
  },
  SuperSword: {
    location: base_sword,
    name: 'sword'
  },
  BasicArmor: {
    location: base_armor,
    name: 'item'
  }
}

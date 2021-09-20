import { EquipAbleItems } from './items';

import base_glove from '../assets/items/gloves/base_glove.glb';
import base_sword from '../assets/items/weapons/base_weapon.glb';
import base_armor from '../assets/items/armor/base_armor.glb';

export const ITEM_MODEL_LOCATION: Record<EquipAbleItems, string> = {
  BasicGloves: base_glove,
  SuperGloves: base_glove,
  BasicSword: base_sword,
  SuperSword: base_sword,
  BasicArmor: base_armor
}

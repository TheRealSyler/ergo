import { ModelInfo } from './loadCharacter';
import { ItemName } from './items';

import base_glove from '../assets/base/base_glove.glb';

export const ITEM_MODEL_INFO: Record<ItemName, ModelInfo> = {
  BasicGloves: {
    location: base_glove,
    name: 'glove'
  },
  AWD: {
    location: base_glove,
    name: 'glove'
  }
}

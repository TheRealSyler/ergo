import { ModelInfo } from './loadCharacter';
import { CharacterClass } from './stats';

import glib_model from '../assets/glib/glib_model.glb';
import glib_model_evil from '../assets/glib/glib_model_evil.glb';

export const CLASS_MODEL_INFO: Record<CharacterClass, ModelInfo> = {
  awd: {
    location: glib_model,
    name: 'glib001'
  },
  awd2: {
    location: glib_model,
    name: 'glib001'
  },
  awd3: {
    location: glib_model_evil,
    name: 'glib001'
  },
  base: {
    location: glib_model,
    name: 'glib001'
  }
}


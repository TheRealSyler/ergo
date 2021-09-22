import { CharacterClass } from './stats';

import glib_model from '../assets/glib/glib_model.glb';
import glib_model_evil from '../assets/glib/glib_model_evil.glb';

export const CLASS_MODEL_INFO: Record<CharacterClass, string> = {
  awd: glib_model,
  awd2: glib_model,
  awd3: glib_model_evil,
  base: glib_model
}


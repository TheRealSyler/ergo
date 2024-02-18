import glib_model from '../assets/glib/glib_model.glb';
import glib_model_evil from '../assets/glib/glib_model_evil.glb';
import type { CharacterClass } from './stats';

export const CLASS_MODEL_INFO: Record<CharacterClass, string> = {
  boss: glib_model_evil,
  awd2: glib_model,
  base: glib_model
}


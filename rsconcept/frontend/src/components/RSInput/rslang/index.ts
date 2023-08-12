import {LRLanguage} from "@codemirror/language"

import { parser } from './parser';

export const RSLanguage = LRLanguage.define({
  parser: parser,
  languageData: {}
});
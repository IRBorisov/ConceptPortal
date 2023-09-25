import {LRLanguage} from '@codemirror/language'

import { parser } from './parser';

export const NaturalLanguage = LRLanguage.define({
  parser: parser,
  languageData: {}
});
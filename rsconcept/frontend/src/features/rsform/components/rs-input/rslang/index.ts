import { LRLanguage } from '@codemirror/language';

import { parser } from './parser';
import { Function, Global, Predicate } from './parser.terms';

export const GlobalTokens = [Global, Function, Predicate] as const;

export const RSLanguage = LRLanguage.define({
  parser: parser,
  languageData: {}
});

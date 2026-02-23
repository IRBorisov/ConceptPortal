import { LRLanguage } from '@codemirror/language';

import { parser } from './parser';
import { Function, Global, Local, Predicate } from './parser.terms';

export const IdentifierTokens = [Global, Function, Predicate, Local] as const;

export const RSLanguage = LRLanguage.define({
  parser: parser,
  languageData: {}
});

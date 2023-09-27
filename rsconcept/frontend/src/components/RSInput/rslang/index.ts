import {LRLanguage} from '@codemirror/language'

import { parser } from './parser';
import { Function, Global, Predicate } from './parser.terms';

export const GlobalTokens: number[] = [
  Global, Function, Predicate
]

export const RSLanguage = LRLanguage.define({
  parser: parser,
  languageData: {}
});
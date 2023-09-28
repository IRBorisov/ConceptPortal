import {LRLanguage} from '@codemirror/language'

import { parser } from './parser';
import { RefEntity, RefSyntactic } from './parser.terms';

export const ReferenceTokens: number[] = [
  RefSyntactic, RefEntity
]

export const NaturalLanguage = LRLanguage.define({
  parser: parser,
  languageData: {}
});
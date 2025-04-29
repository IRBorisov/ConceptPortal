import { LRLanguage } from '@codemirror/language';

import { parser } from './parser';
import { RefEntity, RefSyntactic } from './parser.terms';

export const ReferenceTokens = [RefSyntactic, RefEntity] as const;

export const NaturalLanguage = LRLanguage.define({
  parser: parser,
  languageData: {}
});

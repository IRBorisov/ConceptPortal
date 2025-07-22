import { LRLanguage } from '@codemirror/language';

import { parser } from './parser';

export const PromptLanguage = LRLanguage.define({
  parser: parser,
  languageData: {}
});

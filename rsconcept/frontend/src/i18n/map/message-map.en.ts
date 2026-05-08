import { txGeneralEn } from '../app/general.en';
import { txShellEn } from '../app/shell.en';
import { txAiEn } from '../domain/ai.en';
import { txLangEn } from '../domain/lang.en';
import { txLibraryEn } from '../domain/library.en';
import { txRslangEn } from '../domain/rslang.en';

export const enMessageMap: Record<string, string> = {
  ...txGeneralEn,
  ...txLibraryEn,
  ...txLangEn,
  ...txRslangEn,
  ...txShellEn,
  ...txAiEn
};

import { txGeneralFr } from '../app/general.fr';
import { txShellFr } from '../app/shell.fr';
import { txAiFr } from '../domain/ai.fr';
import { txLangFr } from '../domain/lang.fr';
import { txLibraryFr } from '../domain/library.fr';
import { txRslangFr } from '../domain/rslang.fr';

export const frMessageMap: Record<string, string> = {
  ...txGeneralFr,
  ...txLibraryFr,
  ...txLangFr,
  ...txRslangFr,
  ...txShellFr,
  ...txAiFr
};

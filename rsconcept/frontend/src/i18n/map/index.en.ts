import { txGeneralEn } from '../app/general.en';
import { txMsgEn } from '../app/msg.en';
import { txShellEn } from '../app/shell.en';
import { txAiEn } from '../domain/ai.en';
import { txLangEn } from '../domain/lang.en';
import { txLibraryEn } from '../domain/library.en';
import { txRslangEn } from '../domain/rslang.en';
import { txSandboxEn } from '../domain/sandbox.en';

import { labelsEn } from './partials/labels.en';
import { uiEn } from './partials/ui.en';
import { uiExtraEn } from './partials/ui-extra.en';

export const enMessages: Record<string, string> = {
  ...txGeneralEn,
  ...txMsgEn,
  ...txLibraryEn,
  ...txLangEn,
  ...txRslangEn,
  ...txShellEn,
  ...txAiEn,
  ...txSandboxEn,
  ...labelsEn,
  ...uiEn,
  ...uiExtraEn
};

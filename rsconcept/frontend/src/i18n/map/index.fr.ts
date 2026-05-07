import { txGeneralFr } from '../app/general.fr';
import { txMsgFr } from '../app/msg.fr';
import { txShellFr } from '../app/shell.fr';
import { txAiFr } from '../domain/ai.fr';
import { txLangFr } from '../domain/lang.fr';
import { txLibraryFr } from '../domain/library.fr';
import { txRslangFr } from '../domain/rslang.fr';
import { txSandboxFr } from '../domain/sandbox.fr';

import { labelsFr } from './partials/labels.fr';
import { uiExtraFr } from './partials/ui-extra.fr';

export const frMessages: Record<string, string> = {
  ...txGeneralFr,
  ...txMsgFr,
  ...txLibraryFr,
  ...txLangFr,
  ...txRslangFr,
  ...txShellFr,
  ...txAiFr,
  ...txSandboxFr,
  ...labelsFr,
  ...uiExtraFr
};

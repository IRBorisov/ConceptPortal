import { txGeneralRu } from '../app/general.ru';
import { txMsgRu } from '../app/msg.ru';
import { txShellRu } from '../app/shell.ru';
import { txAiRu } from '../domain/ai.ru';
import { txLangRu } from '../domain/lang.ru';
import { txLibraryRu } from '../domain/library.ru';
import { txRslangRu } from '../domain/rslang.ru';
import { txSandboxRu } from '../domain/sandbox.ru';

import { labelsRu } from './partials/labels.ru';
import { uiRu } from './partials/ui.ru';
import { uiExtraRu } from './partials/ui-extra.ru';

export const ruMessages: Record<string, string> = {
  ...txGeneralRu,
  ...txMsgRu,
  ...txLibraryRu,
  ...txLangRu,
  ...txRslangRu,
  ...txShellRu,
  ...txAiRu,
  ...txSandboxRu,
  ...labelsRu,
  ...uiRu,
  ...uiExtraRu
};

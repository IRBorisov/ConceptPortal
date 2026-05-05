import { txGeneralRu } from './items/general.ru';
import { txLangRu } from './items/lang.ru';
import { txLibraryRu } from './items/library.ru';
import { txMsgRu } from './items/msg.ru';
import { txNavRu } from './items/nav.ru';
import { txRslangRu } from './items/rslang.ru';
import { labelsRu } from './partials/labels.ru';
import { shellRu } from './partials/shell.ru';
import { uiRu } from './partials/ui.ru';
import { uiExtraRu } from './partials/ui-extra.ru';
import { semanticRu } from './semantic/semantic.ru';

export const ruMessages: Record<string, string> = {
  ...txGeneralRu,
  ...txMsgRu,
  ...txLibraryRu,
  ...txLangRu,
  ...txRslangRu,
  ...txNavRu,
  ...semanticRu,
  ...shellRu,
  ...labelsRu,
  ...uiRu,
  ...uiExtraRu
};

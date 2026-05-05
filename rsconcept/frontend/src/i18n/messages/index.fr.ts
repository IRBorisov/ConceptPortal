import { txGeneralFr } from './items/general.fr';
import { txLangFr } from './items/lang.fr';
import { txLibraryFr } from './items/library.fr';
import { txMsgFr } from './items/msg.fr';
import { txNavFr } from './items/nav.fr';
import { txRslangFr } from './items/rslang.fr';
import { labelsFr } from './partials/labels.fr';
import { shellFr } from './partials/shell.fr';
import { uiFr } from './partials/ui.fr';
import { uiExtraFr } from './partials/ui-extra.fr';
import { semanticFr } from './semantic/semantic.fr';

export const frMessages: Record<string, string> = {
  ...txGeneralFr,
  ...txMsgFr,
  ...txLibraryFr,
  ...txLangFr,
  ...txRslangFr,
  ...txNavFr,
  ...semanticFr,
  ...shellFr,
  ...labelsFr,
  ...uiFr,
  ...uiExtraFr
};

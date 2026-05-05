import { txGeneralFr } from './items/general.fr';
import { txLangFr } from './items/lang.fr';
import { txLibraryFr } from './items/library.fr';
import { txRslangFr } from './items/rslang.fr';
import { labelsFr } from './partials/labels.fr';
import { navFr } from './partials/nav.fr';
import { shellFr } from './partials/shell.fr';
import { uiFr } from './partials/ui.fr';
import { uiExtraFr } from './partials/ui-extra.fr';
import { semanticFr } from './semantic/semantic.fr';

export const frMessages: Record<string, string> = {
  ...txGeneralFr,
  ...txLibraryFr,
  ...txLangFr,
  ...txRslangFr,
  ...semanticFr,
  ...navFr,
  ...shellFr,
  ...labelsFr,
  ...uiFr,
  ...uiExtraFr
};

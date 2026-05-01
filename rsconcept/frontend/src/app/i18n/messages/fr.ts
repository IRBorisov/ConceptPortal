import { labelsFr } from './partials/labels.fr';
import { libraryFr } from './partials/library.fr';
import { navFr } from './partials/nav.fr';
import { shellFr } from './partials/shell.fr';
import { uiFr } from './partials/ui.fr';
import { uiExtraFr } from './partials/ui-extra.fr';

export const frMessages: Record<string, string> = {
  ...navFr,
  ...shellFr,
  ...libraryFr,
  ...labelsFr,
  ...uiFr,
  ...uiExtraFr
};

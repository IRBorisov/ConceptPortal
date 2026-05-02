import { labelsEn } from './partials/labels.en';
import { libraryEn } from './partials/library.en';
import { navEn } from './partials/nav.en';
import { shellEn } from './partials/shell.en';
import { uiEn } from './partials/ui.en';
import { uiExtraEn } from './partials/ui-extra.en';

export const enMessages: Record<string, string> = {
  ...navEn,
  ...shellEn,
  ...libraryEn,
  ...labelsEn,
  ...uiEn,
  ...uiExtraEn
};

import { labelsEn } from './partials/labels.en';
import { libraryEn } from './partials/library.en';
import { navEn } from './partials/nav.en';
import { shellEn } from './partials/shell.en';
import { uiEn } from './partials/ui.en';
import { uiExtraEn } from './partials/ui-extra.en';
import { semanticEn } from './semantic/semantic.en';

export const enMessages: Record<string, string> = {
  ...semanticEn,
  ...navEn,
  ...shellEn,
  ...libraryEn,
  ...labelsEn,
  ...uiEn,
  ...uiExtraEn
};

import { txGeneralEn } from './items/general.en';
import { txLangEn } from './items/lang.en';
import { txLibraryEn } from './items/library.en';
import { txRslangEn } from './items/rslang.en';
import { labelsEn } from './partials/labels.en';
import { navEn } from './partials/nav.en';
import { shellEn } from './partials/shell.en';
import { uiEn } from './partials/ui.en';
import { uiExtraEn } from './partials/ui-extra.en';
import { semanticEn } from './semantic/semantic.en';

export const enMessages: Record<string, string> = {
  ...txGeneralEn,
  ...txLibraryEn,
  ...txLangEn,
  ...txRslangEn,
  ...semanticEn,
  ...navEn,
  ...shellEn,
  ...labelsEn,
  ...uiEn,
  ...uiExtraEn
};

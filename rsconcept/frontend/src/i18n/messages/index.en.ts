import { txGeneralEn } from './items/general.en';
import { txLangEn } from './items/lang.en';
import { txLibraryEn } from './items/library.en';
import { txMsgEn } from './items/msg.en';
import { txNavEn } from './items/nav.en';
import { txRslangEn } from './items/rslang.en';
import { labelsEn } from './partials/labels.en';
import { shellEn } from './partials/shell.en';
import { uiEn } from './partials/ui.en';
import { uiExtraEn } from './partials/ui-extra.en';
import { semanticEn } from './semantic/semantic.en';

export const enMessages: Record<string, string> = {
  ...txGeneralEn,
  ...txMsgEn,
  ...txLibraryEn,
  ...txLangEn,
  ...txRslangEn,
  ...txNavEn,
  ...semanticEn,
  ...shellEn,
  ...labelsEn,
  ...uiEn,
  ...uiExtraEn
};

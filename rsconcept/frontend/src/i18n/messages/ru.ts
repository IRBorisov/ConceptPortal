import { labelsRu } from './partials/labels.ru';
import { libraryRu } from './partials/library.ru';
import { navRu } from './partials/nav.ru';
import { shellRu } from './partials/shell.ru';
import { uiRu } from './partials/ui.ru';
import { uiExtraRu } from './partials/ui-extra.ru';

export const ruMessages: Record<string, string> = {
  ...navRu,
  ...shellRu,
  ...libraryRu,
  ...labelsRu,
  ...uiRu,
  ...uiExtraRu
};

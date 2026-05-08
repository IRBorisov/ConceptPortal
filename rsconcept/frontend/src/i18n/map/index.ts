import { type AppLocale } from '../locales';

import { enMessageMap } from './message-map.en';
import { frMessageMap } from './message-map.fr';
import { ruMessageMap } from './message-map.ru';

export function getMessageMapForLocale(locale: AppLocale): Record<string, string> {
  switch (locale) {
    case 'en':
      return enMessageMap;
    case 'fr':
      return frMessageMap;
    case 'ru':
      return ruMessageMap;
    default:
      return ruMessageMap;
  }
}

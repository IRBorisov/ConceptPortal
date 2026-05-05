import { type AppLocale } from '../locales';

import { enMessages } from './index.en';
import { frMessages } from './index.fr';
import { ruMessages } from './index.ru';

export function getMessagesForLocale(locale: AppLocale): Record<string, string> {
  switch (locale) {
    case 'en':
      return enMessages;
    case 'fr':
      return frMessages;
    case 'ru':
      return ruMessages;
    default:
      return ruMessages;
  }
}

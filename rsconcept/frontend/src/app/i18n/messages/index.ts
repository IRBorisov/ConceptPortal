import { type AppLocale } from '../locales';

import { enMessages } from './en';
import { frMessages } from './fr';
import { ruMessages } from './ru';

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

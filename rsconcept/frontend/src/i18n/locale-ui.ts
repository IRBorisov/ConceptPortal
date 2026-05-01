import { type AppLocale, SUPPORTED_LOCALES } from './locales';
import { type useTx } from './use-tx';

export const APP_LOCALE_OPTIONS: readonly AppLocale[] = SUPPORTED_LOCALES;

export function localeLabel(tx: ReturnType<typeof useTx>, locale: AppLocale) {
  switch (locale) {
    case 'en':
      return tx('nav.locale.en', 'English');
    case 'fr':
      return tx('nav.locale.fr', 'French');
    case 'ru':
      return tx('nav.locale.ru', 'Russian');
  }
}

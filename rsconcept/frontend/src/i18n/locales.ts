/** Supported UI locales (BCP-47 base language). */
export type AppLocale = 'en' | 'fr' | 'ru';

/** Supported locales. */
export const SUPPORTED_LOCALES: readonly AppLocale[] = ['en', 'fr', 'ru'] as const;

/** Product default locale. */
export const DEFAULT_LOCALE: AppLocale = 'ru';

/** Maps browser language list to a supported locale, or {@link DEFAULT_LOCALE}. */
export function pickSupportedLocaleFromNavigator(): AppLocale {
  const candidates: string[] = [];
  if (navigator.languages?.length) {
    for (const lang of navigator.languages) {
      if (lang) {
        candidates.push(lang);
      }
    }
  }
  if (navigator.language) {
    candidates.push(navigator.language);
  }
  // First, check if DEFAULT_LOCALE is present in candidates (directly or as base tag)
  for (const tag of candidates) {
    const base = baseLanguageTag(tag);
    if (base === DEFAULT_LOCALE) {
      return DEFAULT_LOCALE;
    }
  }
  // Otherwise, check for other supported locales
  for (const tag of candidates) {
    const base = baseLanguageTag(tag);
    if (base === 'en' || base === 'fr' || base === 'ru') {
      return base;
    }
  }
  return DEFAULT_LOCALE;
}

// ===== Internals ======

function baseLanguageTag(tag: string): string {
  const trimmed = tag.trim().toLowerCase();
  const i = trimmed.indexOf('-');
  return i === -1 ? trimmed : trimmed.slice(0, i);
}

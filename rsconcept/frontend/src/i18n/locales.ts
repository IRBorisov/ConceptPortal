/** Supported UI locales (BCP-47 base language). */
export type AppLocale = 'ru' | 'en' | 'fr';

/** Supported locales. */
export const SUPPORTED_LOCALES: readonly AppLocale[] = ['ru', 'en', 'fr'] as const;

/** Product default locale. */
export const DEFAULT_LOCALE: AppLocale = 'ru';

/** Maps browser language list to a supported locale, or {@link DEFAULT_LOCALE}. */
export function inferLocaleFromNavigator(): AppLocale {
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

/** Language name in that language (endonym), for locale pickers — not translated by UI locale. */
export function localeLabel(locale: AppLocale) {
  switch (locale) {
    case 'en':
      return 'English';
    case 'fr':
      return 'Français';
    case 'ru':
      return 'Русский';
  }
}

// ===== Internals ======

function baseLanguageTag(tag: string): string {
  const trimmed = tag.trim().toLowerCase();
  const i = trimmed.indexOf('-');
  return i === -1 ? trimmed : trimmed.slice(0, i);
}

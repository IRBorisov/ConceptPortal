/** Supported UI locales (BCP-47 base language). */
export type AppLocale = 'en' | 'fr' | 'ru';

export const SUPPORTED_LOCALES: readonly AppLocale[] = ['en', 'fr', 'ru'] as const;

/** Product default when browser languages do not match a supported locale. */
export const DEFAULT_LOCALE: AppLocale = 'ru';

export interface NavigatorLocaleSource {
  language?: string;
  languages?: readonly string[];
}

function baseLanguageTag(tag: string): string {
  const trimmed = tag.trim().toLowerCase();
  const i = trimmed.indexOf('-');
  return i === -1 ? trimmed : trimmed.slice(0, i);
}

/** Maps browser language list to a supported locale, or {@link DEFAULT_LOCALE}. */
export function pickSupportedLocaleFromNavigator(
  nav: NavigatorLocaleSource = typeof navigator !== 'undefined' ? navigator : { language: '', languages: [] }
): AppLocale {
  const candidates: string[] = [];
  if (nav.languages?.length) {
    for (const lang of nav.languages) {
      if (lang) {
        candidates.push(lang);
      }
    }
  }
  if (nav.language) {
    candidates.push(nav.language);
  }
  for (const tag of candidates) {
    const base = baseLanguageTag(tag);
    if (base === 'en' || base === 'fr' || base === 'ru') {
      return base;
    }
  }
  return DEFAULT_LOCALE;
}

export function parsePersistedLocale(value: unknown): AppLocale | null {
  if (value === 'en' || value === 'fr' || value === 'ru') {
    return value;
  }
  return null;
}

/**
 * Resolves locale: explicit value from persisted preferences state wins; otherwise
 * {@link pickSupportedLocaleFromNavigator}.
 */
export function resolveInitialLocale(
  portalPreferencesJson: string | null,
  nav: NavigatorLocaleSource = typeof navigator !== 'undefined' ? navigator : { language: '', languages: [] }
): AppLocale {
  if (portalPreferencesJson) {
    try {
      const root = JSON.parse(portalPreferencesJson) as { state?: { locale?: unknown } };
      const fromStore = parsePersistedLocale(root.state?.locale);
      if (fromStore) {
        return fromStore;
      }
    } catch {
      /* ignore invalid JSON */
    }
  }
  return pickSupportedLocaleFromNavigator(nav);
}

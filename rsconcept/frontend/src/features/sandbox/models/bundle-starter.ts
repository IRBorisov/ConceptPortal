import { type AppLocale, DEFAULT_LOCALE } from '@/i18n';

import starterEn from './starter-bundles/starter-bundle.en.json';
import starterFr from './starter-bundles/starter-bundle.fr.json';
import starterRu from './starter-bundles/starter-bundle.ru.json';
import { type SandboxBundle, schemaSandboxBundle } from './bundle';

const STARTER_BY_LOCALE = {
  ru: starterRu,
  en: starterEn,
  fr: starterFr
} as const satisfies Record<AppLocale, unknown>;

function stampStarterBundleTimestamps(bundle: SandboxBundle, iso: string): void {
  bundle.meta.updatedAt = iso;
  bundle.schema.time_create = iso;
  bundle.schema.time_update = iso;
  bundle.model.time_create = iso;
  bundle.model.time_update = iso;
}

/** Maps BCP-47 tags (e.g. from `react-intl`) to a supported starter bundle locale. */
export function resolveStarterLocale(tag: string | undefined): AppLocale {
  const base = tag?.split('-')[0]?.toLowerCase() ?? '';
  if (base === 'en' || base === 'fr' || base === 'ru') {
    return base;
  }
  return DEFAULT_LOCALE;
}

/** Fresh starter sandbox bundle for the given UI locale (validated with the same Zod schema as imports). */
export function createStarterSandboxBundle(locale: AppLocale = DEFAULT_LOCALE): SandboxBundle {
  const iso = new Date().toISOString();
  const raw = STARTER_BY_LOCALE[locale] ?? STARTER_BY_LOCALE.ru;
  const draft = structuredClone(raw);
  const bundle = schemaSandboxBundle.parse(draft);
  stampStarterBundleTimestamps(bundle, iso);
  return bundle;
}

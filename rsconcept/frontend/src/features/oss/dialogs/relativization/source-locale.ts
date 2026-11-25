import { francAll } from 'franc-min';

import { type AppLocale } from '@/i18n';

interface SourceText {
  term_raw: string;
  term_resolved?: string;
  definition_raw: string;
  definition_resolved?: string;
  convention: string;
}

function clean(text: string) {
  return text
    .replace(/@\{[^}]*\}|\b[XCSDFRPT]\d+\b/g, ' ')
    .replace(/[^\p{L}]+/gu, ' ')
    .trim();
}

function detect(sample: string): AppLocale | undefined {
  const russianLetters = sample.match(/\p{Script=Cyrillic}/gu)?.length ?? 0;
  const latinLetters = sample.match(/\p{Script=Latin}/gu)?.length ?? 0;
  if (russianLetters > latinLetters) return 'ru';
  if (latinLetters === 0) return undefined;

  const [best, alternative] = francAll(sample, { only: ['eng', 'fra'], minLength: 6 });
  if (best && alternative && best[1] - alternative[1] >= 0.15 && (best[0] === 'fra' || best[0] === 'eng')) {
    return best[0] === 'fra' ? 'fr' : 'en';
  }
  return /[àâæçéèêëîïôœùûüÿ]/iu.test(sample) ? 'fr' : undefined;
}

/** Use original constituent prose before titles or UI preferences. */
export function getRelativizationLocale(
  source: { title: string; items: readonly SourceText[] } | undefined,
  fallback: AppLocale
): AppLocale {
  if (!source) return fallback;
  const text = clean(
    source.items
      .map(item =>
        [item.definition_resolved || item.definition_raw, item.convention, item.term_resolved || item.term_raw].join(
          ' '
        )
      )
      .join('\n')
  );
  const title = clean(source.title);
  return detect(text) ?? detect(title) ?? (/\p{Script=Latin}/u.test(text || title) ? 'en' : fallback);
}

export const defaultContextNames: Record<AppLocale, string> = { en: 'context', fr: 'contexte', ru: 'контекст' };

import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, pickSupportedLocaleFromNavigator, resolveInitialLocale } from './locales';

describe('pickSupportedLocaleFromNavigator', () => {
  it('maps en-US to en', () => {
    expect(pickSupportedLocaleFromNavigator({ language: 'en-US', languages: ['en-US'] })).toBe('en');
  });

  it('maps fr-CA to fr', () => {
    expect(pickSupportedLocaleFromNavigator({ language: 'fr-CA', languages: ['fr-CA', 'en'] })).toBe('fr');
  });

  it('maps ru to ru', () => {
    expect(pickSupportedLocaleFromNavigator({ language: 'ru-RU', languages: ['ru-RU'] })).toBe('ru');
  });

  it('returns default for unsupported languages', () => {
    expect(pickSupportedLocaleFromNavigator({ language: 'de-DE', languages: ['de-DE'] })).toBe(DEFAULT_LOCALE);
  });

  it('prefers first supported language in languages list', () => {
    expect(
      pickSupportedLocaleFromNavigator({
        language: 'en-US',
        languages: ['ja-JP', 'fr-FR', 'en-US']
      })
    ).toBe('fr');
  });
});

describe('resolveInitialLocale', () => {
  it('uses persisted locale when present', () => {
    const json = JSON.stringify({ state: { locale: 'fr' }, version: 5 });
    expect(resolveInitialLocale(json, { language: 'en-US', languages: ['en-US'] })).toBe('fr');
  });

  it('falls back to navigator when locale missing in storage', () => {
    const json = JSON.stringify({ state: { darkMode: true }, version: 4 });
    expect(resolveInitialLocale(json, { language: 'en-GB', languages: ['en-GB'] })).toBe('en');
  });

  it('falls back to default when storage invalid and navigator unsupported', () => {
    expect(resolveInitialLocale('{not json', { language: 'de', languages: ['de'] })).toBe(DEFAULT_LOCALE);
  });

  it('uses navigator when storage is null', () => {
    expect(resolveInitialLocale(null, { language: 'fr', languages: ['fr'] })).toBe('fr');
  });
});

import { flushSync } from 'react-dom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type AppLocale, pickSupportedLocaleFromNavigator } from '@/i18n';

import { PARAMETER } from '@/utils/constants';

/** localStorage key for {@link usePreferencesStore} persist payload. */
export const PREFERENCES_STORAGE_KEY = 'portal.preferences';

export const videoPlayerTypes = ['vk', 'youtube'] as const;

/** Represents video player type. */
export type VideoPlayerType = (typeof videoPlayerTypes)[number];

export type { AppLocale } from '@/i18n';

interface PreferencesStore {
  locale: AppLocale;
  setLocale: (value: AppLocale) => void;

  darkMode: boolean;
  toggleDarkMode: () => void;

  showHelp: boolean;
  toggleShowHelp: () => void;

  adminMode: boolean;
  toggleAdminMode: () => void;

  libraryPagination: number;
  setLibraryPagination: (value: number) => void;

  showDataText: boolean;
  toggleShowDataText: () => void;

  showRSFormStats: boolean;
  toggleShowRSFormStats: () => void;

  showRSModelStats: boolean;
  toggleShowRSModelStats: () => void;

  showOSSStats: boolean;
  toggleShowOSSStats: () => void;

  showExpressionControls: boolean;
  toggleShowExpressionControls: () => void;

  showOssSidePanel: boolean;
  toggleShowOssSidePanel: () => void;

  preferredPlayer: VideoPlayerType;
  setPreferredPlayer: (value: VideoPlayerType) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    set => ({
      locale: pickSupportedLocaleFromNavigator(),
      setLocale: value =>
        set(state => {
          if (state.locale === value) {
            return state;
          }
          setTimeout(function reloadAfterLocaleChange() {
            window.location.reload();
          }, 0);
          return { locale: value };
        }),

      darkMode: initializeDarkMode(),
      toggleDarkMode: () => {
        if (!document.startViewTransition) {
          set(state => applyDarkMode(!state.darkMode));
          return;
        }
        const style = document.createElement('style');
        style.innerHTML = `
          * {
            animation: none !important;
            transition: none !important;
          }
        `;
        document.head.appendChild(style);

        document.startViewTransition(() => {
          flushSync(() => {
            set(state => applyDarkMode(!state.darkMode));
          });
        });

        setTimeout(function removeTransitionDisabler() {
          document.head.removeChild(style);
        }, PARAMETER.moveDuration);
      },

      showHelp: true,
      toggleShowHelp: () => set(state => ({ showHelp: !state.showHelp })),

      adminMode: false,
      toggleAdminMode: () => set(state => ({ adminMode: !state.adminMode })),

      libraryPagination: 20,
      setLibraryPagination: value =>
        set(state => (state.libraryPagination === value ? state : { libraryPagination: value })),

      showDataText: true,
      toggleShowDataText: () => set(state => ({ showDataText: !state.showDataText })),

      showRSFormStats: true,
      toggleShowRSFormStats: () => set(state => ({ showRSFormStats: !state.showRSFormStats })),

      showRSModelStats: true,
      toggleShowRSModelStats: () => set(state => ({ showRSModelStats: !state.showRSModelStats })),

      showOSSStats: true,
      toggleShowOSSStats: () => set(state => ({ showOSSStats: !state.showOSSStats })),

      showExpressionControls: true,
      toggleShowExpressionControls: () => set(state => ({ showExpressionControls: !state.showExpressionControls })),

      showOssSidePanel: true,
      toggleShowOssSidePanel: () => set(state => ({ showOssSidePanel: !state.showOssSidePanel })),

      preferredPlayer: 'vk',
      setPreferredPlayer: value => set(state => (state.preferredPlayer === value ? state : { preferredPlayer: value }))
    }),
    {
      version: 6,
      name: PREFERENCES_STORAGE_KEY
    }
  )
);

/** Reads UI locale from persisted preferences JSON (zustand persist shape). */
export function parsePersistedPreferencesLocale(raw: string | null): AppLocale | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const state = (parsed as { state?: unknown }).state;
    if (!state || typeof state !== 'object') {
      return null;
    }
    const locale = (state as { locale?: unknown }).locale;
    if (locale === 'en' || locale === 'fr' || locale === 'ru') {
      return locale;
    }
  } catch {
    // ignore malformed storage
  }
  return null;
}

function initializeDarkMode(): boolean {
  let isDark = false;
  if (PREFERENCES_STORAGE_KEY in localStorage) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const preferences = JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? '{}').state as PreferencesStore;
    isDark = preferences.darkMode;
  } else if (window.matchMedia) {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  return isDark;
}

function applyDarkMode(isDark: boolean) {
  const root = window.document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  root.setAttribute('data-color-scheme', !isDark ? 'light' : 'dark');
  return { darkMode: isDark };
}

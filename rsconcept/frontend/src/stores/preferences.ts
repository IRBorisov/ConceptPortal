import { flushSync } from 'react-dom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  type AppLocale,
  parsePersistedLocale,
  pickSupportedLocaleFromNavigator,
  resolveInitialLocale
} from '@/i18n/locales';

import { PARAMETER } from '@/utils/constants';

export const videoPlayerTypes = ['vk', 'youtube'] as const;

/** Represents video player type. */
export type VideoPlayerType = (typeof videoPlayerTypes)[number];

export type { AppLocale } from '@/i18n/locales';

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
      locale: initializeLocale(),
      setLocale: value => set(state => (state.locale === value ? state : { locale: value })),

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
      version: 5,
      name: 'portal.preferences',
      migrate: (persistedState, _version) => {
        const partial = { ...(persistedState as Partial<PreferencesStore>) };
        const locale = parsePersistedLocale(partial.locale) ?? pickSupportedLocaleFromNavigator();
        return { ...partial, locale };
      }
    }
  )
);

function readPortalPreferencesJson(): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem('portal.preferences');
}

function initializeLocale(): AppLocale {
  return resolveInitialLocale(readPortalPreferencesJson());
}

function initializeDarkMode(): boolean {
  let isDark = false;
  if ('portal.preferences' in localStorage) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const preferences = JSON.parse(localStorage.getItem('portal.preferences') ?? '{}').state as PreferencesStore;
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

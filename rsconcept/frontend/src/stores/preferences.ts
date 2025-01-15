import { flushSync } from 'react-dom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { PARAMETER } from '@/utils/constants';

interface PreferencesStore {
  darkMode: boolean;
  toggleDarkMode: () => void;

  showHelp: boolean;
  toggleShowHelp: () => void;

  adminMode: boolean;
  toggleAdminMode: () => void;

  libraryPagination: number;
  setLibraryPagination: (value: number) => void;

  showCstSideList: boolean;
  toggleShowCstSideList: () => void;

  showExpressionControls: boolean;
  toggleShowExpressionControls: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    set => ({
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

        setTimeout(() => document.head.removeChild(style), PARAMETER.moveDuration);
      },

      showHelp: true,
      toggleShowHelp: () => set(state => ({ showHelp: !state.showHelp })),

      adminMode: false,
      toggleAdminMode: () => set(state => ({ adminMode: !state.adminMode })),

      libraryPagination: 50,
      setLibraryPagination: value => set({ libraryPagination: value }),

      showCstSideList: true,
      toggleShowCstSideList: () => set(state => ({ showCstSideList: !state.showCstSideList })),

      showExpressionControls: true,
      toggleShowExpressionControls: () => set(state => ({ showExpressionControls: !state.showExpressionControls }))
    }),
    {
      version: 1,
      name: 'portal.preferences'
    }
  )
);

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

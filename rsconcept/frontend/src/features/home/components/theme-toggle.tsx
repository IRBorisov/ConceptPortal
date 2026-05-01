'use client';

import clsx from 'clsx';

import { useTx } from '@/app/i18n/use-tx';

import { IconDarkTheme, IconLightTheme } from '@/components/icons';
import { usePreferencesStore } from '@/stores/preferences';

export function ThemeToggle() {
  const tx = useTx();
  const darkMode = usePreferencesStore(state => state.darkMode);
  const toggleDarkMode = usePreferencesStore(state => state.toggleDarkMode);

  return (
    <div
      className={clsx('fixed right-1 top-1 z-navigation', 'rounded-full p-0.5 pointer-events-auto')}
      role='group'
      aria-label={tx('home.theme.groupAria', 'Color theme')}
    >
      <div className='flex'>
        <button
          tabIndex={-1}
          type='button'
          onClick={toggleDarkMode}
          className={clsx(
            'flex items-center justify-center rounded-full p-1.5 cc-animate-color',
            !darkMode ? 'bg-muted/50 text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={!darkMode}
          aria-label={tx('home.theme.lightAria', 'Light theme')}
        >
          <IconLightTheme size='0.75rem' aria-hidden />
        </button>
        <button
          tabIndex={-1}
          type='button'
          onClick={toggleDarkMode}
          className={clsx(
            'flex items-center justify-center rounded-full p-1.5 cc-animate-color',
            darkMode ? 'bg-muted/50 text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={darkMode}
          aria-label={tx('home.theme.darkAria', 'Dark theme')}
        >
          <IconDarkTheme size='0.75rem' aria-hidden />
        </button>
      </div>
    </div>
  );
}

'use client';

import { IconDarkTheme, IconLightTheme } from '@/components/icons';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';

export function ThemeToggle() {
  const darkMode = usePreferencesStore(state => state.darkMode);
  const toggleDarkMode = usePreferencesStore(state => state.toggleDarkMode);

  return (
    <div
      className={cn(
        'fixed right-1 top-1 z-navigation',
        'rounded-full p-0.5 pointer-events-auto'
      )}
      role='group'
      aria-label='Тема оформления'
    >
      <div className='flex'>
        <button
          tabIndex={-1}
          type='button'
          onClick={toggleDarkMode}
          className={cn(
            'flex items-center justify-center rounded-full p-1.5 cc-animate-color',
            !darkMode
              ? 'bg-muted/50 text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={!darkMode}
          aria-label='Светлая тема'
        >
          <IconLightTheme size='0.75rem' aria-hidden />
        </button>
        <button
          tabIndex={-1}
          type='button'
          onClick={toggleDarkMode}
          className={cn(
            'flex items-center justify-center rounded-full p-1.5 cc-animate-color',
            darkMode
              ? 'bg-muted/50 text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={darkMode}
          aria-label='Тёмная тема'
        >
          <IconDarkTheme size='0.75rem' aria-hidden />
        </button>
      </div>
    </div>
  );
}

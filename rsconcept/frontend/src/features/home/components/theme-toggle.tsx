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
        'pointer-events-auto fixed right-1 top-1 z-navigation',
        'rounded-full border bg-card/90 p-0.5 backdrop-blur-sm',
        'dark:border-prim-500/40 dark:bg-prim-200/20'
      )}
      role='group'
      aria-label='Тема оформления'
    >
      <div className='flex gap-px'>
        <button
          type='button'
          onClick={toggleDarkMode}
          className={cn(
            'flex items-center justify-center rounded-full p-1.5 cc-animate-color',
            !darkMode
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:bg-prim-200/30'
          )}
          aria-pressed={!darkMode}
          aria-label='Светлая тема'
        >
          <IconLightTheme size='0.8125rem' className='shrink-0' aria-hidden />
        </button>
        <button
          type='button'
          onClick={toggleDarkMode}
          className={cn(
            'flex items-center justify-center rounded-full p-1.5 cc-animate-color',
            darkMode
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:bg-prim-200/30'
          )}
          aria-pressed={darkMode}
          aria-label='Тёмная тема'
        >
          <IconDarkTheme size='0.8125rem' className='shrink-0' aria-hidden />
        </button>
      </div>
    </div>
  );
}

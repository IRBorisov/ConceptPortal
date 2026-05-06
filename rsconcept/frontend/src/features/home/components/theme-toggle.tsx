'use client';

import clsx from 'clsx';

import { useTx } from '@/i18n';

import { IconDarkTheme, IconLightTheme } from '@/components/icons';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const tx = useTx();
  const darkMode = usePreferencesStore(state => state.darkMode);
  const toggleDarkMode = usePreferencesStore(state => state.toggleDarkMode);

  return (
    <div
      className={cn('rounded-full p-0.5 pointer-events-auto', className)}
      role='group'
      aria-label={tx('tx.shell.theme')}
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
          aria-label={tx('tx.shell.theme.light')}
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
          aria-label={tx('tx.shell.theme.dark')}
        >
          <IconDarkTheme size='0.75rem' aria-hidden />
        </button>
      </div>
    </div>
  );
}

'use client';

import clsx from 'clsx';

import { APP_LOCALE_OPTIONS, localeLabel } from '@/app/i18n/locale-ui';
import { useTx } from '@/app/i18n/use-tx';

import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconLanguage } from '@/components/icons';
import { cn } from '@/components/utils';
import { type AppLocale, usePreferencesStore } from '@/stores/preferences';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const tx = useTx();
  const locale = usePreferencesStore(state => state.locale);
  const setLocale = usePreferencesStore(state => state.setLocale);
  const { elementRef, isOpen, toggle, hide, handleBlur } = useDropdown();

  function pickLocale(next: AppLocale) {
    setLocale(next);
    hide();
  }

  return (
    <div ref={elementRef} onBlur={handleBlur} className={cn('rounded-full p-0.5 pointer-events-auto', className)}>
      <button
        tabIndex={-1}
        type='button'
        onClick={toggle}
        className={clsx(
          'flex items-center justify-center gap-1 rounded-full px-2 py-1.5 cc-animate-color',
          'bg-background/80 text-muted-foreground shadow-sm border backdrop-blur',
          'hover:text-foreground focus-outline'
        )}
        aria-label={tx('home.language.toggleAria', 'Change interface language')}
        aria-haspopup='true'
        aria-expanded={isOpen}
      >
        <IconLanguage size='0.75rem' aria-hidden />
        <span className='text-[0.65rem] font-semibold uppercase leading-none'>{locale}</span>
      </button>
      <Dropdown isOpen={isOpen} stretchLeft margin='mt-1' className='min-w-40'>
        <div className='px-3 py-1 text-xs text-muted-foreground border-b'>
          {tx('home.language.groupAria', 'Interface language')}
        </div>
        {APP_LOCALE_OPTIONS.map(option => (
          <DropdownButton
            key={option}
            text={localeLabel(tx, option)}
            icon={<IconLanguage size='1rem' />}
            data-testid={`home-locale-option-${option}`}
            className={clsx(locale === option && 'bg-accent')}
            onClick={() => pickLocale(option)}
          />
        ))}
      </Dropdown>
    </div>
  );
}

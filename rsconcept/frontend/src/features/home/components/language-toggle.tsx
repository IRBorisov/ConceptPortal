'use client';

import clsx from 'clsx';

import { type AppLocale, localeLabel, SUPPORTED_LOCALES, useTx } from '@/i18n';

import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconLanguage } from '@/components/icons';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';

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
        aria-label={tx('tx.nav.language.title')}
        aria-haspopup='true'
        aria-expanded={isOpen}
      >
        <IconLanguage size='0.75rem' aria-hidden />
        <span className='text-[0.65rem] font-semibold uppercase leading-none'>{locale}</span>
      </button>
      <Dropdown isOpen={isOpen} stretchLeft margin='mt-1' className='min-w-40'>
        <div className='px-3 py-1 text-xs text-muted-foreground border-b'>{tx('tx.nav.language.label')}</div>
        {SUPPORTED_LOCALES.map(option => (
          <DropdownButton
            key={option}
            text={localeLabel(option)}
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

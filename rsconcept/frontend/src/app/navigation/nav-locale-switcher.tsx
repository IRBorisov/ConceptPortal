'use client';

import clsx from 'clsx';

import { localeLabel, SUPPORTED_LOCALES, useTx } from '@/i18n';

import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconLanguage } from '@/components/icons';
import { type AppLocale, usePreferencesStore } from '@/stores/preferences';

import { NavigationButton } from './navigation-button';

export function NavLocaleSwitcher() {
  const tx = useTx();
  const locale = usePreferencesStore(state => state.locale);
  const setLocale = usePreferencesStore(state => state.setLocale);
  const { elementRef, isOpen, toggle, hide, handleBlur } = useDropdown();

  function pickLocale(next: AppLocale) {
    setLocale(next);
    hide();
  }

  return (
    <div ref={elementRef} onBlur={handleBlur} className='relative -ml-3 flex items-center h-full'>
      <NavigationButton
        text={locale.toUpperCase()}
        title={tx('nav.language.title', 'Change interface language')}
        hideTitle={isOpen}
        onClick={toggle}
        aria-haspopup='true'
        aria-expanded={isOpen}
        className='text-xs'
      />
      <Dropdown isOpen={isOpen} stretchLeft margin='mt-1' className='min-w-40'>
        <div className='px-3 py-1 text-muted-foreground border-b text-nowrap'>
          {tx('nav.language.label', 'Interface language')}
        </div>
        {SUPPORTED_LOCALES.map(option => (
          <DropdownButton
            key={option}
            text={localeLabel(option)}
            icon={<IconLanguage size='1rem' />}
            data-testid={`nav-locale-option-${option}`}
            className={clsx(locale === option && 'bg-accent')}
            onClick={() => pickLocale(option)}
          />
        ))}
      </Dropdown>
    </div>
  );
}

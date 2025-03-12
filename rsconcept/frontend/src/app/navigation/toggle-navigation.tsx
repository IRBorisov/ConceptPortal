'use client';

import { IconDarkTheme, IconLightTheme, IconPin, IconUnpin } from '@/components/icons';
import { useAppLayoutStore } from '@/stores/app-layout';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';

export function ToggleNavigation() {
  const darkMode = usePreferencesStore(state => state.darkMode);
  const toggleDarkMode = usePreferencesStore(state => state.toggleDarkMode);
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
  const toggleNoNavigation = useAppLayoutStore(state => state.toggleNoNavigation);
  return (
    <div className='absolute top-0 right-0 z-navigation h-12 grid'>
      <button
        tabIndex={-1}
        type='button'
        className='p-1 cursor-pointer self-start'
        onClick={toggleNoNavigation}
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-content={noNavigationAnimation ? 'Показать навигацию' : 'Скрыть навигацию'}
      >
        {!noNavigationAnimation ? <IconPin size='0.75rem' /> : null}
        {noNavigationAnimation ? <IconUnpin size='0.75rem' /> : null}
      </button>
      {!noNavigationAnimation ? (
        <button
          tabIndex={-1}
          type='button'
          className='p-1 cursor-pointer'
          onClick={toggleDarkMode}
          data-tooltip-id={globalIDs.tooltip}
          data-tooltip-content={darkMode ? 'Тема: Темная' : 'Тема: Светлая'}
        >
          {darkMode ? <IconDarkTheme size='0.75rem' /> : null}
          {!darkMode ? <IconLightTheme size='0.75rem' /> : null}
        </button>
      ) : null}
    </div>
  );
}

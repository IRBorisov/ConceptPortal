import clsx from 'clsx';

import { IconDarkTheme, IconLightTheme, IconPin, IconUnpin } from '@/components/Icons';
import { useAppLayoutStore } from '@/stores/appLayout';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs, PARAMETER } from '@/utils/constants';

export function ToggleNavigation() {
  const darkMode = usePreferencesStore(state => state.darkMode);
  const toggleDarkMode = usePreferencesStore(state => state.toggleDarkMode);
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const noNavigationAnimation = useAppLayoutStore(state => state.noNavigationAnimation);
  const toggleNoNavigation = useAppLayoutStore(state => state.toggleNoNavigation);
  const iconSize = !noNavigationAnimation ? '0.75rem' : '1rem';
  return (
    <div
      className={clsx(
        'absolute top-0 right-0 z-navigation',
        'min-h-[2rem] min-w-[2rem]',
        'flex items-end justify-center gap-1',
        'select-none',
        !noNavigation && 'flex-col-reverse'
      )}
      style={{
        willChange: 'height, width',
        transitionProperty: 'height, width',
        transitionDuration: `${PARAMETER.moveDuration}ms`,
        height: noNavigationAnimation ? '2rem' : '3rem',
        width: noNavigationAnimation ? '3rem' : '2rem'
      }}
    >
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
      <button
        tabIndex={-1}
        type='button'
        className='p-1 cursor-pointer'
        onClick={toggleNoNavigation}
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-content={noNavigationAnimation ? 'Показать навигацию' : 'Скрыть навигацию'}
      >
        {!noNavigationAnimation ? <IconPin size={iconSize} /> : null}
        {noNavigationAnimation ? <IconUnpin size={iconSize} /> : null}
      </button>
    </div>
  );
}

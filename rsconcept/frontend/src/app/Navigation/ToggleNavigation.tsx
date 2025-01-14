import clsx from 'clsx';

import { IconDarkTheme, IconLightTheme, IconPin, IconUnpin } from '@/components/Icons';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useAppLayoutStore } from '@/stores/appLayout';
import { globals, PARAMETER } from '@/utils/constants';

function ToggleNavigation() {
  const { toggleDarkMode, darkMode } = useConceptOptions();
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
        transitionProperty: 'height, width, background-color',
        transitionDuration: `${PARAMETER.moveDuration}ms`,
        height: noNavigationAnimation ? '2rem' : '3rem',
        width: noNavigationAnimation ? '3rem' : '2rem'
      }}
    >
      {!noNavigationAnimation ? (
        <button
          tabIndex={-1}
          type='button'
          className='p-1'
          onClick={toggleDarkMode}
          data-tooltip-id={globals.tooltip}
          data-tooltip-content={darkMode ? 'Тема: Темная' : 'Тема: Светлая'}
        >
          {darkMode ? <IconDarkTheme size='0.75rem' /> : null}
          {!darkMode ? <IconLightTheme size='0.75rem' /> : null}
        </button>
      ) : null}
      <button
        tabIndex={-1}
        type='button'
        className='p-1'
        onClick={toggleNoNavigation}
        data-tooltip-id={globals.tooltip}
        data-tooltip-content={noNavigationAnimation ? 'Показать навигацию' : 'Скрыть навигацию'}
      >
        {!noNavigationAnimation ? <IconPin size={iconSize} /> : null}
        {noNavigationAnimation ? <IconUnpin size={iconSize} /> : null}
      </button>
    </div>
  );
}

export default ToggleNavigation;

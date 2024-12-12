import clsx from 'clsx';

import { IconPin, IconUnpin } from '@/components/Icons';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { globals, PARAMETER } from '@/utils/constants';

function ToggleNavigation() {
  const { noNavigationAnimation, toggleNoNavigation } = useConceptOptions();
  return (
    <button
      type='button'
      tabIndex={-1}
      className={clsx(
        'absolute top-0 right-0 z-navigation',
        'min-h-[2rem] min-w-[2rem] sm:min-w-fit',
        'flex items-center justify-center',
        'clr-hover',
        'select-none'
      )}
      onClick={toggleNoNavigation}
      data-tooltip-id={globals.tooltip}
      data-tooltip-content={noNavigationAnimation ? 'Показать навигацию' : 'Скрыть навигацию'}
      style={{
        transitionProperty: 'height, width',
        transitionDuration: `${PARAMETER.moveDuration}ms`,
        height: noNavigationAnimation ? '1.2rem' : '3rem',
        width: noNavigationAnimation ? '3rem' : '1.2rem'
      }}
    >
      {!noNavigationAnimation ? <IconPin /> : null}
      {noNavigationAnimation ? <IconUnpin /> : null}
    </button>
  );
}

export default ToggleNavigation;

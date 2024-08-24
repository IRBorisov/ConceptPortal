import clsx from 'clsx';
import { motion } from 'framer-motion';

import { IconPin, IconUnpin } from '@/components/Icons';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { animateNavigationToggle } from '@/styling/animations';
import { globals } from '@/utils/constants';

function ToggleNavigation() {
  const { noNavigationAnimation, toggleNoNavigation } = useConceptOptions();
  return (
    <motion.button
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
      initial={false}
      animate={noNavigationAnimation ? 'off' : 'on'}
      variants={animateNavigationToggle}
      data-tooltip-id={globals.tooltip}
      data-tooltip-content={noNavigationAnimation ? 'Показать навигацию' : 'Скрыть навигацию'}
    >
      {!noNavigationAnimation ? <IconPin /> : null}
      {noNavigationAnimation ? <IconUnpin /> : null}
    </motion.button>
  );
}

export default ToggleNavigation;

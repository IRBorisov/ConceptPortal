import clsx from 'clsx';
import { motion } from 'framer-motion';

import { IconPin, IconUnpin } from '@/components/Icons';
import { useConceptOptions } from '@/context/OptionsContext';
import { animateNavigationToggle } from '@/styling/animations';
import { globals } from '@/utils/constants';

function ToggleNavigationButton() {
  const { noNavigationAnimation, toggleNoNavigation } = useConceptOptions();
  return (
    <motion.button
      type='button'
      tabIndex={-1}
      className={clsx(
        'absolute top-0 right-0 z-navigation flex items-center justify-center',
        'clr-btn-nav',
        'select-none disabled:cursor-not-allowed'
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

export default ToggleNavigationButton;

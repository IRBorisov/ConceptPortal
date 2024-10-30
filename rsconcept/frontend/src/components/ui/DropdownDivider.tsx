import clsx from 'clsx';
import { motion } from 'framer-motion';

import { animateDropdownItem } from '@/styling/animations';

import { DividerProps } from './Divider';

/**
 * {@link Divider} with animation inside {@link Dropdown}.
 */
function DropdownDivider({ vertical, margins = 'mx-2', className, ...restProps }: DividerProps) {
  return (
    <motion.div
      variants={animateDropdownItem}
      className={clsx(
        margins, //prettier: split-lines
        className,
        {
          'border-x': vertical,
          'border-y': !vertical
        }
      )}
      {...restProps}
    />
  );
}

export default DropdownDivider;

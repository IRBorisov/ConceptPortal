import clsx from 'clsx';
import { motion } from 'framer-motion';

import { CProps } from '@/components/props';
import { animateDropdownItem } from '@/styling/animations';

interface DividerAnimatedProps extends CProps.Styling {
  vertical?: boolean;
  margins?: string;
}

function DividerAnimated({ vertical, margins = 'mx-2', className, ...restProps }: DividerAnimatedProps) {
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

export default DividerAnimated;

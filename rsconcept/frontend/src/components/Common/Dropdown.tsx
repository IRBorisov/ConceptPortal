import clsx from 'clsx';
import { motion } from 'framer-motion';

import { animateDropdown } from '@/utils/animations';

import { CProps } from '../props';

interface DropdownProps
extends CProps.Styling {
  stretchLeft?: boolean
  isOpen: boolean
  children: React.ReactNode
}

function Dropdown({
  isOpen, stretchLeft,
  className,
  children,
  ...restProps
}: DropdownProps) {  
  return (
  <div className='relative'>
  <motion.div
    className={clsx(
      'z-modal-tooltip',
      'absolute mt-3',
      'flex flex-col',
      'border rounded-md shadow-lg',
      'text-sm',
      'clr-input',
      {
        'right-0': stretchLeft,
        'left-0': !stretchLeft
      },
      className
    )}
    initial={false}
    animate={isOpen ? 'open' : 'closed'}
    variants={animateDropdown}
    {...restProps}
  >
    {children}
  </motion.div>
  </div>);
}

export default Dropdown;
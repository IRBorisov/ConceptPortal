import clsx from 'clsx';
import { motion } from 'framer-motion';

import { animateDropdownItem } from '@/styling/animations';

import Checkbox, { CheckboxProps } from './Checkbox';

/** DropdownCheckbox animated component that renders a {@link Checkbox} inside a {@link Dropdown} item. */
function DropdownCheckbox({ setValue, disabled, ...restProps }: CheckboxProps) {
  return (
    <motion.div
      variants={animateDropdownItem}
      className={clsx(
        'px-3 py-1',
        'text-left overflow-ellipsis whitespace-nowrap',
        'disabled:clr-text-controls',
        !!setValue && !disabled && 'clr-hover'
      )}
    >
      <Checkbox tabIndex={-1} disabled={disabled} setValue={setValue} {...restProps} />
    </motion.div>
  );
}

export default DropdownCheckbox;

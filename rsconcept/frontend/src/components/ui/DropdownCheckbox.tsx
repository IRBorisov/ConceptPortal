import clsx from 'clsx';
import { motion } from 'framer-motion';

import { animateDropdownItem } from '@/styling/animations';

import Checkbox from './Checkbox';

interface DropdownCheckboxProps {
  value: boolean;
  label?: string;
  title?: string;
  disabled?: boolean;
  setValue?: (newValue: boolean) => void;
}

function DropdownCheckbox({ title, setValue, disabled, ...restProps }: DropdownCheckboxProps) {
  return (
    <motion.div
      variants={animateDropdownItem}
      title={title}
      className={clsx(
        'px-3 py-1',
        'text-left overflow-ellipsis whitespace-nowrap',
        'disabled:clr-text-controls',
        !!setValue && !disabled && 'clr-hover'
      )}
    >
      <Checkbox disabled={disabled} setValue={setValue} {...restProps} />
    </motion.div>
  );
}

export default DropdownCheckbox;

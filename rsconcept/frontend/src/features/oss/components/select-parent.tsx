import clsx from 'clsx';

import { IconConceptBlock } from '@/components/icons';
import { globalIDs } from '@/utils/constants';

import { type Block } from '../models/oss';

import { SelectBlock } from './select-block';

interface SelectParentProps {
  id?: string;
  value: Block | null;
  onChange: (newValue: Block | null) => void;

  fullWidth?: boolean;
  items?: Block[];
  placeholder?: string;
  noBorder?: boolean;
  popoverClassname?: string;
}

export function SelectParent({ fullWidth, ...restProps }: SelectParentProps) {
  return (
    <div className={clsx('flex gap-2 items-center', !fullWidth ? 'w-80' : 'w-full')}>
      <IconConceptBlock
        tabIndex={-1}
        size='2rem'
        className='text-primary min-w-8'
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-content='Родительский блок'
      />
      <SelectBlock className={fullWidth ? 'grow' : 'w-70'} {...restProps} />
    </div>
  );
}

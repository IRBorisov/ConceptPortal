'use client';

import { useTx } from '@/i18n';
import { type Block } from '@rsconcept/domain/library';

import { IconConceptBlock } from '@/components/icons';
import { cn } from '@/components/utils';
import { globalIDs } from '@/utils/constants';

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
  const tx = useTx();
  return (
    <div className={cn('flex gap-2 items-center', !fullWidth ? 'w-80' : 'w-full')}>
      <IconConceptBlock
        tabIndex={-1}
        size='2rem'
        className='text-primary min-w-8'
        data-tooltip-id={globalIDs.tooltip}
        data-tooltip-content={tx('tx.oss.block.parent')}
      />
      <SelectBlock className={fullWidth ? 'grow' : 'w-70'} {...restProps} />
    </div>
  );
}

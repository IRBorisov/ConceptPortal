'use client';

import { useTx } from '@/i18n/use-tx';

import { IconDatabase } from '@/components/icons';
import { type Styling } from '@/components/props';
import { IndicatorPill } from '@/components/view/indicator-pill';

interface PillValueClassProps extends Styling {
  value: boolean;
  disabled?: boolean;
  toggleValue: () => void;
}

/** Displays toggle for value class of a constituent. */
export function PillValueClass({ value, toggleValue, ...restProps }: PillValueClassProps) {
  const tx = useTx();
  return (
    <IndicatorPill
      className='text-sm font-controls py-0.5 gap-1 -mt-0.5'
      title={value ? tx('tx.rslang.valueClass.full.hint') : tx('tx.rslang.valueClass.property.hint')}
      value={
        value
          ? tx('tx.rslang.valueClass.full').toLocaleLowerCase()
          : tx('tx.rslang.valueClass.property').toLocaleLowerCase()
      }
      icon={<IconDatabase size='1rem' />}
      color={value ? 'muted' : 'teal'}
      onClick={toggleValue}
      {...restProps}
    />
  );
}

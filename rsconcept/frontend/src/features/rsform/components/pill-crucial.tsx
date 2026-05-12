'use client';

import { useTx } from '@/i18n/use-tx';

import { IconCrucial } from '@/components/icons';
import { type Styling } from '@/components/props';
import { IndicatorPill } from '@/components/view/indicator-pill';

interface PillCrucialProps extends Styling {
  value: boolean;
  disabled?: boolean;
  toggleValue: () => void;
}

/** Displays toggle for crucial status of a constituent. */
export function PillCrucial({ value, toggleValue, ...restProps }: PillCrucialProps) {
  const tx = useTx();
  return (
    <IndicatorPill
      className='text-sm font-controls py-0.5 gap-1 -mt-0.5'
      title={value ? tx('tx.cst.crucial.disable') : tx('tx.cst.crucial.enable')}
      value={
        value ? tx('tx.cst.crucial.badgeOn').toLocaleLowerCase() : tx('tx.cst.crucial.badgeOff').toLocaleLowerCase()
      }
      icon={<IconCrucial size='1rem' />}
      color={value ? 'teal' : 'muted'}
      onClick={toggleValue}
      {...restProps}
    />
  );
}

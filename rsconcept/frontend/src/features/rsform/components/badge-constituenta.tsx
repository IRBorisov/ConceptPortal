'use client';

import clsx from 'clsx';

import { type Constituenta } from '@/domain/library';

import { globalIDs } from '@/utils/constants';

import { colorBgBadge, colorFgCstStatus } from '../colors';
import { useCstTooltipStore } from '../stores/cst-tooltip';

interface BadgeConstituentaProps {
  /** Prefix for tooltip ID. */
  prefixID?: string;

  /** Constituenta to display. */
  value: Constituenta;
}

/**
 * Displays a badge with a constituenta alias and information tooltip.
 */
export function BadgeConstituenta({ value, prefixID }: BadgeConstituentaProps) {
  const setActiveCst = useCstTooltipStore(state => state.setActiveCst);

  return (
    <div
      id={prefixID ? `${prefixID}${value.id}` : undefined}
      className={clsx(
        'w-12',
        'px-1 text-center border rounded-lg',
        'font-medium whitespace-nowrap',
        value.is_inherited && 'border-dashed',
        value.crucial && 'shadow-[inset_0_1px_3px_0,inset_0_-1px_3px_0]',
        colorBgBadge(value)
      )}
      style={{
        borderColor: colorFgCstStatus(value.status),
        color: colorFgCstStatus(value.status)
      }}
      data-tooltip-id={globalIDs.constituenta_tooltip}
      onMouseEnter={() => setActiveCst(value)}
    >
      {value.alias}
    </div>
  );
}

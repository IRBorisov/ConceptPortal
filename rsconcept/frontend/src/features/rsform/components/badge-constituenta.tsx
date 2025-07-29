import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { colorFgCstStatus } from '../colors';
import { CstClass, type IConstituenta } from '../models/rsform';
import { useCstTooltipStore } from '../stores/cst-tooltip';

interface BadgeConstituentaProps {
  /** Prefix for tooltip ID. */
  prefixID?: string;

  /** Constituenta to display. */
  value: IConstituenta;
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
        'cc-badge-constituenta',
        value.is_inherited && 'border-dashed',
        value.crucial && 'cc-badge-inner-shadow',
        value.cst_class === CstClass.BASIC ? 'bg-accent-green25' : 'bg-input'
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

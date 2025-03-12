import clsx from 'clsx';

import { APP_COLORS } from '@/styling/colors';
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
      className={clsx('cc-badge-constituenta', value.is_inherited && 'border-dashed')}
      style={{
        borderColor: colorFgCstStatus(value.status),
        color: colorFgCstStatus(value.status),
        backgroundColor: value.cst_class === CstClass.BASIC ? APP_COLORS.bgGreen25 : APP_COLORS.bgInput
      }}
      data-tooltip-id={globalIDs.constituenta_tooltip}
      onMouseEnter={() => setActiveCst(value)}
    >
      {value.alias}
    </div>
  );
}

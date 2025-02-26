import clsx from 'clsx';

import { type Styling } from '@/components/props';
import { APP_COLORS } from '@/styling/colors';
import { globalIDs } from '@/utils/constants';

import { colorFgCstStatus } from '../colors';
import { CstClass, type IConstituenta } from '../models/rsform';
import { useCstTooltipStore } from '../stores/cstTooltip';

interface BadgeConstituentaProps extends Styling {
  /** Prefix for tooltip ID. */
  prefixID?: string;

  /** Constituenta to display. */
  value: IConstituenta;
}

/**
 * Displays a badge with a constituenta alias and information tooltip.
 */
export function BadgeConstituenta({ value, prefixID, className, style }: BadgeConstituentaProps) {
  const setActiveCst = useCstTooltipStore(state => state.setActiveCst);

  return (
    <div
      id={prefixID ? `${prefixID}${value.id}` : undefined}
      className={clsx(
        'min-w-[3.1rem] max-w-[3.1rem]',
        'px-1',
        'border rounded-md',
        value.is_inherited && 'border-dashed',
        'text-center font-medium whitespace-nowrap',
        className
      )}
      style={{
        borderColor: colorFgCstStatus(value.status),
        color: colorFgCstStatus(value.status),
        backgroundColor: value.cst_class === CstClass.BASIC ? APP_COLORS.bgGreen25 : APP_COLORS.bgInput,
        ...style
      }}
      data-tooltip-id={globalIDs.constituenta_tooltip}
      onMouseEnter={() => setActiveCst(value)}
    >
      {value.alias}
    </div>
  );
}

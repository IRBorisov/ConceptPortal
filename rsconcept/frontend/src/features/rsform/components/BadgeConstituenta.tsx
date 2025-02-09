import clsx from 'clsx';

import { CProps } from '@/components/props';
import { useTooltipsStore } from '@/stores/tooltips';
import { APP_COLORS, colorFgCstStatus } from '@/styling/color';
import { globals } from '@/utils/constants';

import { CstClass, IConstituenta } from '../models/rsform';

interface BadgeConstituentaProps extends CProps.Styling {
  /** Prefix for tooltip ID. */
  prefixID?: string;

  /** Constituenta to display. */
  value: IConstituenta;
}

/**
 * Displays a badge with a constituenta alias and information tooltip.
 */
function BadgeConstituenta({ value, prefixID, className, style }: BadgeConstituentaProps) {
  const setActiveCst = useTooltipsStore(state => state.setActiveCst);

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
      data-tooltip-id={globals.constituenta_tooltip}
      onMouseEnter={() => setActiveCst(value)}
    >
      {value.alias}
    </div>
  );
}

export default BadgeConstituenta;

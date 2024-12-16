import clsx from 'clsx';

import { CstClass, IConstituenta } from '@/models/rsform';
import { APP_COLORS, colorFgCstStatus } from '@/styling/color';

import { CProps } from '../props';
import TooltipConstituenta from './TooltipConstituenta';

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
  return (
    <div
      id={`${prefixID}${value.id}`}
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
    >
      {value.alias}
      <TooltipConstituenta anchor={`#${prefixID}${value.id}`} data={value} />
    </div>
  );
}

export default BadgeConstituenta;

import clsx from 'clsx';

import { CstClass, IConstituenta } from '@/models/rsform';
import { colorFgCstStatus, IColorTheme } from '@/styling/color';

import { CProps } from '../props';
import TooltipConstituenta from './TooltipConstituenta';

interface BadgeConstituentaProps extends CProps.Styling {
  prefixID?: string;
  value: IConstituenta;
  theme: IColorTheme;
}

function BadgeConstituenta({ value, prefixID, className, style, theme }: BadgeConstituentaProps) {
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
        borderColor: colorFgCstStatus(value.status, theme),
        color: colorFgCstStatus(value.status, theme),
        backgroundColor: value.cst_class === CstClass.BASIC ? theme.bgGreen25 : theme.bgInput,
        ...style
      }}
    >
      {value.alias}
      <TooltipConstituenta anchor={`#${prefixID}${value.id}`} data={value} />
    </div>
  );
}

export default BadgeConstituenta;

import clsx from 'clsx';

import { IConstituenta } from '@/models/rsform';
import { isMockCst } from '@/models/rsformAPI';
import { colorFgCstStatus, IColorTheme } from '@/styling/color';

import TooltipConstituenta from './TooltipConstituenta';

interface BadgeConstituentaProps {
  prefixID?: string;
  value: IConstituenta;
  theme: IColorTheme;
}

function BadgeConstituenta({ value, prefixID, theme }: BadgeConstituentaProps) {
  return (
    <div
      id={`${prefixID}${value.alias}`}
      className={clsx(
        'min-w-[3.1rem] max-w-[3.1rem]', // prettier: split lines
        'px-1',
        'border rounded-md',
        value.is_inherited && 'border-dashed',
        'text-center font-medium whitespace-nowrap'
      )}
      style={{
        borderColor: colorFgCstStatus(value.status, theme),
        color: colorFgCstStatus(value.status, theme),
        backgroundColor: isMockCst(value) ? theme.bgWarning : theme.bgInput
      }}
    >
      {value.alias}
      <TooltipConstituenta anchor={`#${prefixID}${value.alias}`} data={value} />
    </div>
  );
}

export default BadgeConstituenta;

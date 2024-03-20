import clsx from 'clsx';

import ConstituentaTooltip from '@/components/info/ConstituentaTooltip';
import { IConstituenta } from '@/models/rsform';
import { isMockCst } from '@/models/rsformAPI';
import { colorFgCstStatus, IColorTheme } from '@/styling/color';

interface ConstituentaBadgeProps {
  prefixID?: string;
  value: IConstituenta;
  theme: IColorTheme;
}

function ConstituentaBadge({ value, prefixID, theme }: ConstituentaBadgeProps) {
  return (
    <div
      id={`${prefixID}${value.alias}`}
      className={clsx(
        'min-w-[3.1rem] max-w-[3.1rem]', // prettier: split lines
        'px-1',
        'border rounded-md',
        'text-center font-medium whitespace-nowrap'
      )}
      style={{
        borderColor: colorFgCstStatus(value.status, theme),
        color: colorFgCstStatus(value.status, theme),
        backgroundColor: isMockCst(value) ? theme.bgWarning : theme.bgInput
      }}
    >
      {value.alias}
      <ConstituentaTooltip anchor={`#${prefixID}${value.alias}`} data={value} />
    </div>
  );
}

export default ConstituentaBadge;

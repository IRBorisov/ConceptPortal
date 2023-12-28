import clsx from 'clsx';

import ConceptTooltip from '@/components/Common/ConceptTooltip';
import ConstituentaTooltip from '@/components/Help/ConstituentaTooltip';
import { IConstituenta } from '@/models/rsform';
import { isMockCst } from '@/models/rsformAPI';
import { colorFgCstStatus, IColorTheme } from '@/utils/color';
import { describeExpressionStatus } from '@/utils/labels';

interface ConstituentaBadgeProps {
  prefixID?: string;
  shortTooltip?: boolean;
  value: IConstituenta;
  theme: IColorTheme;
}

function ConstituentaBadge({ value, prefixID, shortTooltip, theme }: ConstituentaBadgeProps) {
  return (
    <div
      id={`${prefixID}${value.alias}`}
      className={clsx(
        'min-w-[3.1rem] max-w-[3.1rem]',
        'px-1',
        'border rounded-md',
        'text-center font-semibold whitespace-nowrap'
      )}
      style={{
        borderColor: colorFgCstStatus(value.status, theme),
        color: colorFgCstStatus(value.status, theme),
        backgroundColor: isMockCst(value) ? theme.bgWarning : theme.bgInput
      }}
    >
      {value.alias}
      {!shortTooltip ? <ConstituentaTooltip anchor={`#${prefixID}${value.alias}`} data={value} /> : null}
      {shortTooltip ? (
        <ConceptTooltip anchorSelect={`#${prefixID}${value.alias}`} place='right'>
          <p>
            <b>Статус</b>: {describeExpressionStatus(value.status)}
          </p>
        </ConceptTooltip>
      ) : null}
    </div>
  );
}

export default ConstituentaBadge;

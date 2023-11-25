import { IConstituenta } from '../../models/rsform';
import { isMockCst } from '../../models/rsformAPI';
import { colorfgCstStatus,IColorTheme } from '../../utils/color';
import { describeExpressionStatus } from '../../utils/labels';
import ConceptTooltip from '../common/ConceptTooltip';
import ConstituentaTooltip from '../Help/ConstituentaTooltip';

interface ConstituentaBadgeProps {
  prefixID?: string
  shortTooltip?: boolean
  value: IConstituenta
  theme: IColorTheme
}

function ConstituentaBadge({ value, prefixID, shortTooltip, theme }: ConstituentaBadgeProps) {
  return (<div className='w-fit'>
    <div
      id={`${prefixID}${value.alias}`}
      className='min-w-[3.1rem] max-w-[3.1rem] px-1 text-center rounded-md whitespace-nowrap'
      style={{
        borderWidth: '1px', 
        borderColor: colorfgCstStatus(value.status, theme),
        color: colorfgCstStatus(value.status, theme),
        backgroundColor: isMockCst(value) ? theme.bgWarning : theme.bgInput,
        fontWeight: 600
      }}
    >
      {value.alias}
    </div>
    { !shortTooltip && <ConstituentaTooltip data={value} anchor={`#${prefixID}${value.alias}`} />}
    { shortTooltip && 
    <ConceptTooltip
      anchorSelect={`#${prefixID}${value.alias}`}
      place='right'
    >
      <p><span className='font-semibold'>Статус</span>: {describeExpressionStatus(value.status)}</p>
    </ConceptTooltip>}
  </div>);
}

export default ConstituentaBadge;

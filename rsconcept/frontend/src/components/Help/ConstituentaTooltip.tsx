import { IConstituenta } from '../../models/rsform';
import ConceptTooltip from '../common/ConceptTooltip';
import InfoConstituenta from './InfoConstituenta';

interface ConstituentaTooltipProps {
  data: IConstituenta
  anchor: string
}

function ConstituentaTooltip({ data, anchor }: ConstituentaTooltipProps) {
  return (
    <ConceptTooltip
      anchorSelect={anchor}
      className='max-w-[25rem] min-w-[25rem]'
    >
      <InfoConstituenta data={data} />
    </ConceptTooltip>
  );
}

export default ConstituentaTooltip;

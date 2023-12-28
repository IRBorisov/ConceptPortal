import ConceptTooltip from '@/components/Common/ConceptTooltip';
import InfoConstituenta from '@/components/Shared/InfoConstituenta';
import { IConstituenta } from '@/models/rsform';

interface ConstituentaTooltipProps {
  data: IConstituenta;
  anchor: string;
}

function ConstituentaTooltip({ data, anchor }: ConstituentaTooltipProps) {
  return (
    <ConceptTooltip clickable anchorSelect={anchor} className='max-w-[30rem]'>
      <InfoConstituenta data={data} />
    </ConceptTooltip>
  );
}

export default ConstituentaTooltip;

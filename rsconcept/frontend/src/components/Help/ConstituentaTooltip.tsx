import Tooltip from '@/components/Common/Tooltip';
import InfoConstituenta from '@/components/Shared/InfoConstituenta';
import { IConstituenta } from '@/models/rsform';

interface ConstituentaTooltipProps {
  data: IConstituenta;
  anchor: string;
}

function ConstituentaTooltip({ data, anchor }: ConstituentaTooltipProps) {
  return (
    <Tooltip clickable anchorSelect={anchor} className='max-w-[30rem]'>
      <InfoConstituenta data={data} />
    </Tooltip>
  );
}

export default ConstituentaTooltip;

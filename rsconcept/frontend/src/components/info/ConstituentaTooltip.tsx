import InfoConstituenta from '@/components/info/InfoConstituenta';
import Tooltip from '@/components/ui/Tooltip';
import { IConstituenta } from '@/models/rsform';

interface ConstituentaTooltipProps {
  data: IConstituenta;
  anchor: string;
}

function ConstituentaTooltip({ data, anchor }: ConstituentaTooltipProps) {
  return (
    <Tooltip clickable layer='z-modal-tooltip' anchorSelect={anchor} className='max-w-[30rem]'>
      <InfoConstituenta data={data} onClick={event => event.stopPropagation()} />
    </Tooltip>
  );
}

export default ConstituentaTooltip;

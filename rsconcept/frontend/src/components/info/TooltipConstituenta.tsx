import InfoConstituenta from '@/components/info/InfoConstituenta';
import Tooltip from '@/components/ui/Tooltip';
import { IConstituenta } from '@/models/rsform';

interface TooltipConstituentaProps {
  data: IConstituenta;
  anchor: string;
}

function TooltipConstituenta({ data, anchor }: TooltipConstituentaProps) {
  return (
    <Tooltip clickable layer='z-modalTooltip' anchorSelect={anchor} className='max-w-[30rem]'>
      <InfoConstituenta data={data} onClick={event => event.stopPropagation()} />
    </Tooltip>
  );
}

export default TooltipConstituenta;

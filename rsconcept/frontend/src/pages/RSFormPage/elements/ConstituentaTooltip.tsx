import ConceptTooltip from '../../../components/Common/ConceptTooltip';
import ConstituentaInfo from '../../../components/Help/ConstituentaInfo';
import { IConstituenta } from '../../../utils/models';

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
      <ConstituentaInfo data={data} />
    </ConceptTooltip>
  );
}

export default ConstituentaTooltip;

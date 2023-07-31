import ConceptTooltip from '../../../components/Common/ConceptTooltip';
import { IConstituenta } from '../../../utils/models';
import { getTypeLabel } from '../../../utils/staticUI';

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
      <h1>Конституента {data.alias}</h1>
      <p><b>Типизация: </b>{getTypeLabel(data)}</p>
      <p><b>Термин: </b>{data.term.resolved || data.term.raw}</p>
      {data.definition.formal && <p><b>Выражение: </b>{data.definition.formal}</p>}
      {data.definition.text.resolved && <p><b>Определение: </b>{data.definition.text.resolved}</p>}
      {data.convention && <p><b>Конвенция: </b>{data.convention}</p>}
    </ConceptTooltip>
  );
}

export default ConstituentaTooltip;

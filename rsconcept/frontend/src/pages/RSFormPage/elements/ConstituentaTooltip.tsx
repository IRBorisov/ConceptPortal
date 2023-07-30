import ConceptTooltip from '../../../components/Common/ConceptTooltip';
import { IConstituenta } from '../../../utils/models';

interface ConstituentaTooltipProps {
  data: IConstituenta
  anchor: string
}

function ConstituentaTooltip({ data, anchor }: ConstituentaTooltipProps) {
  return (
    <ConceptTooltip
      anchorSelect={anchor}
      className='max-w-[20rem] min-w-[20rem]'
    >
      <h1>Конституента {data.alias}</h1>
      <p><b>Типизация: </b>{data.parse.typification}</p>
      <p><b>Тремин: </b>{data.term.resolved || data.term.raw}</p>
      {data.definition.formal && <p><b>Выражение: </b>{data.definition.formal}</p>}
      {data.definition.text.resolved && <p><b>Определение: </b>{data.definition.text.resolved}</p>}
      {data.convention && <p><b>Конвенция: </b>{data.convention}</p>}
    </ConceptTooltip>
  );
}

export default ConstituentaTooltip;

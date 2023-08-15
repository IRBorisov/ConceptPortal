import { IConstituenta } from '../../utils/models';
import { getCstTypificationLabel } from '../../utils/staticUI';

interface ConstituentaInfoProps
extends React.HTMLAttributes<HTMLDivElement> {
  data: IConstituenta
}

function ConstituentaInfo({ data, ...props }: ConstituentaInfoProps) {
  return (
    <div {...props}>
      <h1>Конституента {data.alias}</h1>
      <p><b>Типизация: </b>{getCstTypificationLabel(data)}</p>
      <p><b>Термин: </b>{data.term.resolved || data.term.raw}</p>
      {data.definition.formal && <p><b>Выражение: </b>{data.definition.formal}</p>}
      {data.definition.text.resolved && <p><b>Определение: </b>{data.definition.text.resolved}</p>}
      {data.convention && <p><b>Конвенция: </b>{data.convention}</p>}
    </div>
  );
}

export default ConstituentaInfo;
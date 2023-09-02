import { IConstituenta } from '../../utils/models';
import { getCstTypificationLabel } from '../../utils/staticUI';

interface InfoConstituentaProps
extends React.HTMLAttributes<HTMLDivElement> {
  data: IConstituenta
}

function InfoConstituenta({ data, ...props }: InfoConstituentaProps) {
  return (
    <div {...props}>
      <h1>Конституента {data.alias}</h1>
      <p><b>Типизация: </b>{getCstTypificationLabel(data)}</p>
      <p><b>Термин: </b>{data.term_resolved || data.term_raw}</p>
      {data.definition_formal && <p><b>Выражение: </b>{data.definition_formal}</p>}
      {data.definition_resolved && <p><b>Определение: </b>{data.definition_resolved}</p>}
      {data.convention && <p><b>Конвенция: </b>{data.convention}</p>}
    </div>
  );
}

export default InfoConstituenta;

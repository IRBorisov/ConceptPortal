import { IConstituenta } from '@/models/rsform';
import { labelCstTypification } from '@/utils/labels';

import { CProps } from '../props';

interface InfoConstituentaProps extends CProps.Div {
  data: IConstituenta;
}

function InfoConstituenta({ data, ...restProps }: InfoConstituentaProps) {
  return (
    <div {...restProps}>
      <h2>Конституента {data.alias}</h2>
      <p>
        <b>Типизация: </b>
        {labelCstTypification(data)}
      </p>
      <p>
        <b>Термин: </b>
        {data.term_resolved || data.term_raw}
      </p>
      {data.definition_formal ? (
        <p>
          <b>Выражение: </b>
          {data.definition_formal}
        </p>
      ) : null}
      {data.definition_resolved ? (
        <p>
          <b>Определение: </b>
          {data.definition_resolved}
        </p>
      ) : null}
      {data.convention ? (
        <p>
          <b>Конвенция: </b>
          {data.convention}
        </p>
      ) : null}
    </div>
  );
}

export default InfoConstituenta;

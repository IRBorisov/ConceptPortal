import clsx from 'clsx';

import { IConstituenta } from '@/models/rsform';
import { labelCstTypification } from '@/utils/labels';

import { CProps } from '../props';

interface InfoConstituentaProps extends CProps.Div {
  data: IConstituenta;
}

function InfoConstituenta({ data, className, ...restProps }: InfoConstituentaProps) {
  return (
    <div className={clsx('dense', className)} {...restProps}>
      <h2>Конституента {data.alias}</h2>
      {data.derived_alias ? (
        <p>
          <b>Основана на: </b>
          {data.derived_alias}
        </p>
      ) : null}
      {data.derived_children.length > 0 ? (
        <p>
          <b>Порождает: </b>
          {data.derived_children.join(', ')}
        </p>
      ) : null}
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

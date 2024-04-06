import clsx from 'clsx';

import { IConstituenta } from '@/models/rsform';
import { isBasicConcept } from '@/models/rsformAPI';
import { labelCstTypification } from '@/utils/labels';

import { CProps } from '../props';

interface InfoConstituentaProps extends CProps.Div {
  data: IConstituenta;
}

function InfoConstituenta({ data, className, ...restProps }: InfoConstituentaProps) {
  return (
    <div className={clsx('dense min-w-[15rem]', className)} {...restProps}>
      <h2>Конституента {data.alias}</h2>
      {data.term_resolved ? (
        <p>
          <b>Термин: </b>
          {data.term_resolved || data.term_raw}
        </p>
      ) : null}
      <p>
        <b>Типизация: </b>
        {labelCstTypification(data)}
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
      {data.derived_from_alias ? (
        <p>
          <b>Основание: </b>
          {data.derived_from_alias}
        </p>
      ) : null}
      {data.derived_children_alias.length > 0 ? (
        <p>
          <b>Порождает: </b>
          {data.derived_children_alias.join(', ')}
        </p>
      ) : null}
      {data.convention ? (
        <p>
          <b>{isBasicConcept(data.cst_type) ? 'Конвенция' : 'Комментарий'}: </b>
          {data.convention}
        </p>
      ) : null}
    </div>
  );
}

export default InfoConstituenta;

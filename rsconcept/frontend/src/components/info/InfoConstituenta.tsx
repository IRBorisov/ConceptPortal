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
    <div className={clsx('dense min-w-[15rem] break-words', className)} {...restProps}>
      <h2>
        {data.alias}
        {data.is_inherited ? ' (наследуется)' : ''}
      </h2>
      {data.term_resolved ? (
        <p>
          <b>Термин: </b>
          {data.term_resolved || data.term_raw}
        </p>
      ) : null}
      <p className='break-all'>
        <b>Типизация: </b>
        <span className='font-math'>{labelCstTypification(data)}</span>
      </p>
      {data.definition_formal ? (
        <p className='break-all'>
          <b>Выражение: </b>
          <span className='font-math'>{data.definition_formal}</span>
        </p>
      ) : null}
      {data.definition_resolved ? (
        <p>
          <b>Определение: </b>
          {data.definition_resolved}
        </p>
      ) : null}
      {data.parent_alias ? (
        <p>
          <b>Основание: </b>
          {data.parent_alias}
        </p>
      ) : null}
      {data.children_alias.length > 0 ? (
        <p>
          <b>Порождает: </b>
          {data.children_alias.join(', ')}
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

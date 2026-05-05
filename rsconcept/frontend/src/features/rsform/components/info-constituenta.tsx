'use client';

import { type Constituenta } from '@/domain/library';
import { isBasicConcept } from '@/domain/library/rsform-api';
import { labelType } from '@/domain/rslang/labels';
import { useTx } from '@/i18n';

import { IconChild, IconCrucial } from '@/components/icons';
import { cn } from '@/components/utils';

interface InfoConstituentaProps extends React.ComponentProps<'div'> {
  data: Constituenta;
}

export function InfoConstituenta({ data, className, ...restProps }: InfoConstituentaProps) {
  const tx = useTx();
  return (
    <div className={cn('dense min-w-60 wrap-break-word', className)} {...restProps}>
      <h2 className='cursor-default' title={data.is_inherited ? tx('tx.lib.concept.inheritor') : undefined}>
        {data.alias}
        {data.is_inherited ? <IconChild size='1rem' className='inline-icon align-middle ml-1 mt-1' /> : null}
        {data.crucial ? <IconCrucial size='1rem' className='inline-icon align-middle mt-1' /> : null}
      </h2>
      {data.term_resolved ? (
        <p>
          <b>{tx('tx.lib.term')}: </b>
          {data.term_resolved || data.term_raw}
        </p>
      ) : null}
      <p className='break-all'>
        <b>{tx('tx.rslang.typification')}: </b>
        <span className='font-math'>{labelType(data.analysis?.type ?? null)}</span>
      </p>
      {data.definition_formal ? (
        <p className='break-all'>
          <b>{tx('ui.rsform.cstInfo.expressionLabel')}</b>
          <span className='font-math'>{data.definition_formal}</span>
        </p>
      ) : null}
      {data.definition_resolved ? (
        <p>
          <b>{tx('ui.rsform.cstInfo.definitionLabel')}</b>
          {data.definition_resolved}
        </p>
      ) : null}
      {data.spawner_alias ? (
        <p>
          <b>{tx('ui.rsform.cstInfo.baseLabel')}</b>
          {data.spawner_alias}
        </p>
      ) : null}
      {data.spawn_alias.length > 0 ? (
        <p>
          <b>{tx('ui.rsform.cstInfo.generatesLabel')}</b>
          {data.spawn_alias.join(', ')}
        </p>
      ) : null}
      {data.convention ? (
        <p>
          <b>{isBasicConcept(data.cst_type) ? tx('tx.lib.convention') + ': ' : tx('tx.lib.comment') + ': '}</b>
          {data.convention}
        </p>
      ) : null}
    </div>
  );
}

'use client';

import { createColumnHelper } from '@tanstack/react-table';

import { type CstSubstituteInfo, type Operation, OperationType } from '@/domain/library';
import { useTx } from '@/i18n';

import { DataTable } from '@/components/data-table';
import { IconPageRight } from '@/components/icons';

import { labelOperationType } from '../labels';

interface InfoOperationProps {
  operation: Operation;
}

const columnHelper = createColumnHelper<CstSubstituteInfo>();

export function InfoOperation({ operation }: InfoOperationProps) {
  const tx = useTx();
  const columns = [
    columnHelper.accessor('substitution_term', {
      id: 'substitution_term',
      size: 200
    }),
    columnHelper.accessor('substitution_alias', {
      id: 'substitution_alias',
      size: 50
    }),
    columnHelper.display({
      id: 'status',
      header: '',
      size: 40,
      cell: () => <IconPageRight size='1.2rem' />
    }),
    columnHelper.accessor('original_alias', {
      id: 'original_alias',
      size: 50
    }),
    columnHelper.accessor('original_term', {
      id: 'original_term',
      size: 200
    })
  ];

  return (
    <>
      <h2>{operation.alias}</h2>
      <p className='flex justify-between gap-3'>
        <span>
          <b>{tx('semantic.term.type')}: </b> {labelOperationType(operation.operation_type)}
        </span>
        <span>
          <b>{tx('ui.oss.infoOperation.ownAdditionsLabel')}</b>{' '}
          {operation.has_additions ? tx('semantic.yes') : tx('semantic.no')}
        </span>
      </p>
      {operation.operation_type === OperationType.INPUT && operation.is_import ? (
        <p>
          <b>{tx('ui.oss.infoOperation.csNotInOss')}</b>
        </p>
      ) : null}
      {operation.operation_type === OperationType.SYNTHESIS && operation.is_consolidation ? (
        <p>
          <b>{tx('ui.oss.infoOperation.rhombusSynthesis')}</b>
        </p>
      ) : null}
      {operation.title ? (
        <p>
          <b>{tx('ui.oss.infoOperation.titleWithColon')}</b>
          {operation.title}
        </p>
      ) : null}
      {operation.description ? (
        <p>
          <b>{tx('ui.oss.infoOperation.descriptionWithColon')}</b>
          {operation.description}
        </p>
      ) : null}
      {operation.operation_type === OperationType.SYNTHESIS && operation.substitutions.length > 0 ? (
        <DataTable
          dense
          noHeader
          noFooter
          className='text-sm border-x select-none mb-2'
          data={operation.substitutions}
          columns={columns}
        />
      ) : operation.operation_type !== OperationType.INPUT ? (
        <p>
          <b>{tx('ui.oss.infoOperation.substitutionsLabel')}</b> {tx('ui.oss.infoOperation.substitutionsNone')}
        </p>
      ) : null}
    </>
  );
}

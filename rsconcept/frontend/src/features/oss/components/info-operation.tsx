'use client';

import { createColumnHelper } from '@tanstack/react-table';

import { useTx } from '@/i18n';
import { type CstSubstituteInfo, type Operation, OperationType } from '@rsconcept/domain/library';

import { DataTable } from '@/components/data-table';
import { IconPageRight } from '@/components/icons';
import { truncateToLastWord } from '@/utils/format';

import { labelOperationType } from '../labels';

interface InfoOperationProps {
  operation: Operation;
}

const MAX_DESCRIPTION_LENGTH = 250;
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
    <div className='dense'>
      <h2 className='mb-2'>{operation.alias}</h2>
      <p>
        <b>{tx('tx.rslang.type') + tx('tx.general.colon')}</b>
        {labelOperationType(operation.operation_type)}
      </p>
      {operation.operation_type === OperationType.INPUT && operation.is_import ? (
        <p>
          <b>{tx('tx.oss.input.import')}</b>
        </p>
      ) : null}
      {operation.operation_type === OperationType.SYNTHESIS && operation.is_consolidation ? (
        <p>
          <b>{tx('tx.synthesis.rhombus')}</b>
        </p>
      ) : null}
      {operation.title ? (
        <p>
          <b>{tx('tx.lib.title') + tx('tx.general.colon')}</b>
          {operation.title}
        </p>
      ) : null}
      {!operation.has_additions && operation.operation_type === OperationType.SYNTHESIS ? (
        <p className='text-destructive'>{tx('tx.operation.attachment.validate.noOriginalCst')}</p>
      ) : null}
      {operation.description ? (
        <p>
          <b>{tx('tx.lib.description') + tx('tx.general.colon')}</b>
          {truncateToLastWord(operation.description, MAX_DESCRIPTION_LENGTH)}
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
      ) : null}
    </div>
  );
}

'use client';

import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from '@/components/DataTable';
import { IconPageRight } from '@/components/Icons';

import { type ICstSubstituteInfo, OperationType } from '../backend/types';
import { labelOperationType } from '../labels';
import { type IOperation } from '../models/oss';

interface InfoOperationProps {
  operation: IOperation;
}

const columnHelper = createColumnHelper<ICstSubstituteInfo>();

export function InfoOperation({ operation }: InfoOperationProps) {
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
      <p>
        <b>Тип:</b> {labelOperationType(operation.operation_type)}
      </p>
      {!operation.is_owned ? (
        <p>
          <b>КС не принадлежит ОСС</b>
        </p>
      ) : null}
      {operation.is_consolidation ? (
        <p>
          <b>Ромбовидный синтез</b>
        </p>
      ) : null}
      {operation.title ? (
        <p>
          <b>Название: </b>
          {operation.title}
        </p>
      ) : null}
      {operation.comment ? (
        <p>
          <b>Комментарий: </b>
          {operation.comment}
        </p>
      ) : null}
      {operation.substitutions.length > 0 ? (
        <DataTable
          dense
          noHeader
          noFooter
          className='text-sm border select-none mb-2'
          data={operation.substitutions}
          columns={columns}
        />
      ) : operation.operation_type !== OperationType.INPUT ? (
        <p>
          <b>Отождествления:</b> Отсутствуют
        </p>
      ) : null}
    </>
  );
}

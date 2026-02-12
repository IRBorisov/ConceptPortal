'use client';

import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from '@/components/data-table';
import { IconPageRight } from '@/components/icons';

import { type CstSubstituteInfo, OperationType } from '../backend/types';
import { labelOperationType } from '../labels';
import { type Operation } from '../models/oss';

interface InfoOperationProps {
  operation: Operation;
}

const columnHelper = createColumnHelper<CstSubstituteInfo>();

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
      {operation.operation_type === OperationType.INPUT && operation.is_import ? (
        <p>
          <b>КС не принадлежит ОСС</b>
        </p>
      ) : null}
      {operation.operation_type === OperationType.SYNTHESIS && operation.is_consolidation ? (
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
      {operation.description ? (
        <p>
          <b>Описание: </b>
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
          <b>Отождествления:</b> Отсутствуют
        </p>
      ) : null}
    </>
  );
}

'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import Tooltip from '@/components/ui/Tooltip';
import { OssNodeInternal } from '@/models/miscellaneous';
import { ICstSubstituteEx } from '@/models/oss';
import { labelOperationType } from '@/utils/labels';

import { IconPageRight } from '../Icons';
import DataTable from '../ui/DataTable';

interface TooltipOperationProps {
  node: OssNodeInternal;
  anchor: string;
}

const columnHelper = createColumnHelper<ICstSubstituteEx>();

function TooltipOperation({ node, anchor }: TooltipOperationProps) {
  const columns = useMemo(
    () => [
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
    ],
    []
  );

  const table = useMemo(
    () => (
      <DataTable
        dense
        noHeader
        noFooter
        className='w-full text-sm border select-none mb-2'
        data={node.data.operation.substitutions}
        columns={columns}
      />
    ),
    [columns, node]
  );

  return (
    <Tooltip layer='z-modalTooltip' anchorSelect={anchor} className='max-w-[35rem] max-h-[40rem] dense my-3'>
      <h2>{node.data.operation.alias}</h2>
      <p>
        <b>Тип:</b> {labelOperationType(node.data.operation.operation_type)}
      </p>
      {node.data.operation.title ? (
        <p>
          <b>Название: </b>
          {node.data.operation.title}
        </p>
      ) : null}
      {node.data.operation.comment ? (
        <p>
          <b>Комментарий: </b>
          {node.data.operation.comment}
        </p>
      ) : null}
      <p>
        <b>Положение:</b> [{node.xPos}, {node.yPos}]
      </p>
      {node.data.operation.substitutions.length > 0 ? table : null}
    </Tooltip>
  );
}

export default TooltipOperation;

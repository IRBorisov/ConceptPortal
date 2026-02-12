'use client';

import { useState } from 'react';

import { MiniButton } from '@/components/control';
import { createColumnHelper, DataTable } from '@/components/data-table';
import { IconMoveDown, IconMoveUp, IconRemove } from '@/components/icons';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { NoData } from '@/components/view';

import { type Operation } from '../models/oss';

import { SelectOperation } from './select-operation';

interface PickMultiOperationProps extends Styling {
  value: number[];
  onChange: (newValue: number[]) => void;
  items: Operation[];
  rows?: number;
}

const columnHelper = createColumnHelper<Operation>();

export function PickMultiOperation({ rows, items, value, onChange, className, ...restProps }: PickMultiOperationProps) {
  const selectedItems = value.map(itemID => items.find(item => item.id === itemID)!);
  const nonSelectedItems = items.filter(item => !value.includes(item.id));
  const [lastSelected, setLastSelected] = useState<Operation | null>(null);

  function handleDelete(operation: number) {
    onChange(value.filter(item => item !== operation));
  }

  function handleSelect(operation: Operation | null) {
    if (operation) {
      setLastSelected(operation);
      onChange([...value, operation.id]);
      setTimeout(() => setLastSelected(null), 1000);
    }
  }

  function handleMoveUp(operation: number) {
    const index = value.indexOf(operation);
    if (index > 0) {
      const newSelected = [...value];
      newSelected[index] = newSelected[index - 1];
      newSelected[index - 1] = operation;
      onChange(newSelected);
    }
  }

  function handleMoveDown(operation: number) {
    const index = value.indexOf(operation);
    if (index < value.length - 1) {
      const newSelected = [...value];
      newSelected[index] = newSelected[index + 1];
      newSelected[index + 1] = operation;
      onChange(newSelected);
    }
  }

  const columns = [
    columnHelper.accessor('alias', {
      id: 'alias',
      header: 'Сокращение',
      size: 300,
      minSize: 150,
      maxSize: 300
    }),
    columnHelper.accessor('title', {
      id: 'title',
      header: 'Название',
      size: 1200,
      minSize: 300,
      maxSize: 1200,
      cell: props => <div className='text-ellipsis'>{props.getValue()}</div>
    }),
    columnHelper.display({
      id: 'actions',
      size: 0,
      cell: props => (
        <div className='flex gap-1 w-fit'>
          <MiniButton
            title='Удалить'
            className='px-0'
            icon={<IconRemove size='1rem' className='icon-red' />}
            onClick={() => handleDelete(props.row.original.id)}
          />
          <MiniButton
            title='Переместить выше'
            className='px-0'
            icon={<IconMoveUp size='1rem' className='icon-primary' />}
            onClick={() => handleMoveUp(props.row.original.id)}
          />
          <MiniButton
            title='Переместить ниже'
            className='px-0'
            icon={<IconMoveDown size='1rem' className='icon-primary' />}
            onClick={() => handleMoveDown(props.row.original.id)}
          />
        </div>
      )
    })
  ];

  return (
    <div className={cn('flex flex-col gap-1 border-t border-x rounded-md bg-input', className)} {...restProps}>
      <SelectOperation
        noBorder
        items={nonSelectedItems} //
        value={lastSelected}
        onChange={handleSelect}
      />
      <DataTable
        dense
        noFooter
        rows={rows}
        contentHeight='1.3rem'
        className='cc-scroll-y text-sm select-none border-y rounded-b-md'
        data={selectedItems}
        columns={columns}
        headPosition='0rem'
        noDataComponent={
          <NoData>
            <p>Список пуст</p>
          </NoData>
        }
      />
    </div>
  );
}

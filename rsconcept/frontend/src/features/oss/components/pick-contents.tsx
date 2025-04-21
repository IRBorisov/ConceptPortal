'use client';

import { useState } from 'react';

import { MiniButton } from '@/components/control';
import { createColumnHelper, DataTable } from '@/components/data-table';
import { IconMoveDown, IconMoveUp, IconRemove } from '@/components/icons';
import { ComboBox } from '@/components/input/combo-box';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { NoData } from '@/components/view';

import { labelOssItem } from '../labels';
import { type IBlock, type IOperation, type IOperationSchema } from '../models/oss';
import { isOperation } from '../models/oss-api';

const SELECTION_CLEAR_TIMEOUT = 1000;

interface PickMultiOperationProps extends Styling {
  value: number[];
  onChange: (newValue: number[]) => void;
  schema: IOperationSchema;
  rows?: number;
  disallowBlocks?: boolean;
}

const columnHelper = createColumnHelper<IOperation | IBlock>();

export function PickContents({
  rows,
  schema,
  value,
  disallowBlocks,
  onChange,
  className,
  ...restProps
}: PickMultiOperationProps) {
  const selectedItems = value
    .map(itemID => (itemID > 0 ? schema.operationByID.get(itemID) : schema.blockByID.get(-itemID)))
    .filter(item => item !== undefined);
  const [lastSelected, setLastSelected] = useState<IOperation | IBlock | null>(null);
  const items = [
    ...schema.operations.filter(item => !value.includes(item.id)),
    ...(disallowBlocks ? [] : schema.blocks.filter(item => !value.includes(-item.id)))
  ];

  function handleDelete(operation: number) {
    onChange(value.filter(item => item !== operation));
  }

  function handleSelect(target: IOperation | IBlock | null) {
    if (target) {
      setLastSelected(target);
      onChange([...value, isOperation(target) ? target.id : -target.id]);
      setTimeout(() => setLastSelected(null), SELECTION_CLEAR_TIMEOUT);
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
    columnHelper.accessor(item => isOperation(item), {
      id: 'type',
      header: 'Тип',
      size: 150,
      minSize: 150,
      maxSize: 150,
      cell: props => <div>{isOperation(props.row.original) ? 'Операция' : 'Блок'}</div>
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
        <div className='flex w-fit'>
          <MiniButton
            title='Удалить'
            noHover
            className='px-0'
            icon={<IconRemove size='1rem' className='icon-red' />}
            onClick={() => handleDelete(props.row.original.id)}
          />
          <MiniButton
            title='Переместить выше'
            noHover
            className='px-0'
            icon={<IconMoveUp size='1rem' className='icon-primary' />}
            onClick={() => handleMoveUp(props.row.original.id)}
          />
          <MiniButton
            title='Переместить ниже'
            noHover
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
      <ComboBox
        noBorder
        items={items}
        value={lastSelected}
        placeholder='Выберите операцию или блок'
        idFunc={item => String(item.id)}
        labelValueFunc={item => labelOssItem(item)}
        labelOptionFunc={item => labelOssItem(item)}
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

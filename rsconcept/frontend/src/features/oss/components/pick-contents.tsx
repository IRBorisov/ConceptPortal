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
import { NodeType, type OperationSchema, type OssItem } from '../models/oss';

const SELECTION_CLEAR_TIMEOUT = 1000;

interface PickContentsProps extends Styling {
  value: OssItem[];
  onChange: (newValue: OssItem[]) => void;
  schema: OperationSchema;
  rows?: number;
  exclude?: OssItem[];
  disallowBlocks?: boolean;
}

const columnHelper = createColumnHelper<OssItem>();

export function PickContents({
  rows,
  schema,
  exclude,
  value,
  disallowBlocks,
  onChange,
  className,
  ...restProps
}: PickContentsProps) {
  const [lastSelected, setLastSelected] = useState<OssItem | null>(null);
  const items: OssItem[] = [
    ...(disallowBlocks ? [] : schema.blocks.filter(item => !value.includes(item) && !exclude?.includes(item))),
    ...schema.operations.filter(item => !value.includes(item) && !exclude?.includes(item))
  ];

  function handleDelete(target: OssItem) {
    onChange(value.filter(item => item !== target));
  }

  function handleSelect(target: OssItem | null) {
    if (target) {
      setLastSelected(target);
      onChange([...value, target]);
      setTimeout(() => setLastSelected(null), SELECTION_CLEAR_TIMEOUT);
    }
  }

  function handleMoveUp(target: OssItem) {
    const index = value.indexOf(target);
    if (index > 0) {
      const newSelected = [...value];
      newSelected[index] = newSelected[index - 1];
      newSelected[index - 1] = target;
      onChange(newSelected);
    }
  }

  function handleMoveDown(target: OssItem) {
    const index = value.indexOf(target);
    if (index < value.length - 1) {
      const newSelected = [...value];
      newSelected[index] = newSelected[index + 1];
      newSelected[index + 1] = target;
      onChange(newSelected);
    }
  }

  const columns = [
    columnHelper.accessor(item => item.nodeType === NodeType.OPERATION, {
      id: 'type',
      header: 'Тип',
      size: 150,
      minSize: 150,
      maxSize: 150,
      cell: props => <div>{props.getValue() ? 'Операция' : 'Блок'}</div>
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
            className='px-0'
            icon={<IconRemove size='1rem' className='icon-red' />}
            onClick={() => handleDelete(props.row.original)}
          />
          <MiniButton
            title='Переместить выше'
            className='px-0'
            icon={<IconMoveUp size='1rem' className='icon-primary' />}
            onClick={() => handleMoveUp(props.row.original)}
          />
          <MiniButton
            title='Переместить ниже'
            className='px-0'
            icon={<IconMoveDown size='1rem' className='icon-primary' />}
            onClick={() => handleMoveDown(props.row.original)}
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
        idFunc={item => item.nodeID}
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
        data={value}
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

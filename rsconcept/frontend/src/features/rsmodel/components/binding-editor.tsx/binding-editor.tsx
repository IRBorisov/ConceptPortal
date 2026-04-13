'use client';

import { useState } from 'react';
import { useDebounce } from 'use-debounce';

import { type BasicBinding, DEFAULT_VALUE_TEXT } from '@/domain/library';

import { MiniButton } from '@/components/control';
import { createColumnHelper, DataTable, type IConditionalStyle } from '@/components/data-table';
import { IconNewItem, IconRemove } from '@/components/icons';
import { SearchBar, TextInput } from '@/components/input';
import { cn } from '@/components/utils';
import { NoData } from '@/components/view';
import { PARAMETER } from '@/utils/constants';
import { TextMatcher } from '@/utils/utils';

interface BindingEditorProps {
  className?: string;
  rows?: number;
  value: BasicBinding;
  onChange?: (newValue: BasicBinding) => void;
}

interface BindingValue {
  id: number;
  text: string;
}

const ITEMS_PER_PAGE = 15;
const columnHelper = createColumnHelper<BindingValue>();

export function BindingEditor({ className, rows, value, onChange }: BindingEditorProps) {
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const selectedValue = selected === null ? '' : value[selected];
  const [debouncedFilter] = useDebounce(filter, PARAMETER.searchDebounce);
  const matcher = debouncedFilter ? new TextMatcher(debouncedFilter) : null;
  const isMutable = !!onChange;

  const dataRows: BindingValue[] = Object.entries(value)
    .filter(entry => !matcher || matcher.test(entry[1]) || Number(entry[0]) === selected)
    .map(entry => ({ id: Number(entry[0]), text: entry[1] }))
    .reverse();

  function handleAddElement() {
    if (!onChange) {
      return;
    }
    const newID =
      1 +
      (Object.keys(value)
        .map(id => Number(id))
        .sort((a, b) => a - b)
        .pop() ?? 0);
    const newValue = { ...value, [newID]: DEFAULT_VALUE_TEXT };
    onChange(newValue);
    setSelected(newID);
  }

  function handleDeleteElement(event: React.MouseEvent<Element>, target: BindingValue) {
    event.stopPropagation();
    event.preventDefault();
    if (!onChange) {
      return;
    }
    const newValue = { ...value };
    delete newValue[target.id];
    onChange(newValue);
    if (selected === target.id) {
      setSelected(null);
    }
  }

  function handleChangeSelected(newValue: string) {
    if (!onChange || !selected) {
      return;
    }
    onChange({ ...value, [selected]: newValue });
  }

  function handleRowClick(target: BindingValue) {
    setSelected(prev => (prev === target.id ? null : target.id));
  }

  const columns = [
    columnHelper.accessor('id', {
      id: 'id',
      header: 'ID',
      size: 60,
      minSize: 60,
      maxSize: 60,
      cell: props => props.getValue()
    }),
    columnHelper.accessor('text', {
      id: 'text',
      header: 'Текст',
      size: 200,
      minSize: 200,
      maxSize: 200,
      cell: props => props.getValue()
    }),
    ...(onChange
      ? [
          columnHelper.display({
            id: 'actions',
            size: 0,
            cell: props => (
              <MiniButton
                title='Удалить элемент'
                className='align-middle w-fit'
                noPadding
                icon={<IconRemove size='1.25rem' className='cc-remove' />}
                onClick={event => handleDeleteElement(event, props.row.original)}
              />
            )
          })
        ]
      : [])
  ];

  const conditionalRowStyles: IConditionalStyle<BindingValue>[] = [
    {
      when: (value: BindingValue) => value.id === selected,
      className: 'bg-selected'
    }
  ];

  return (
    <div className={cn('relative w-full flex flex-col', className)}>
      <div className='-mt-1 flex items-center'>
        <div>
          <span>Всего </span>
          <span className='font-math'>{Object.keys(value).length}</span>
        </div>
        <SearchBar id='dlg_value_search' noBorder query={filter} onChangeQuery={setFilter} />
      </div>
      <TextInput
        label='Значение'
        dense
        placeholder='Выделите строку'
        className='mb-3'
        value={selectedValue}
        onChange={event => handleChangeSelected(event.target.value)}
        disabled={selected === null || !isMutable}
      />
      <div className='relative w-full max-w-full overflow-x-auto'>
        {isMutable ? (
          <MiniButton
            title='Добавить элемент'
            className='absolute top-1 z-pop right-2.5'
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            onClick={handleAddElement}
          />
        ) : null}
        <DataTable
          data={dataRows}
          dense
          columns={columns}
          headPosition='0rem'
          skipWidthCalculation
          rows={rows}
          contentHeight='1.29rem'
          className='cc-scroll-y text-sm select-none border'
          onRowClicked={handleRowClick}
          enablePagination
          autoResetPageIndex={false}
          paginationPerPage={ITEMS_PER_PAGE}
          paginationOptions={[ITEMS_PER_PAGE]}
          conditionalRowStyles={conditionalRowStyles}
          noDataComponent={
            <NoData>
              <p>Значения отсутствуют</p>
            </NoData>
          }
        />
      </div>
    </div>
  );
}

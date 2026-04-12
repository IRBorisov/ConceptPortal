'use client';

import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { useDebounce } from 'use-debounce';

import { DataTable, type IConditionalStyle } from '@/components/data-table';
import { SearchBar, TextInput } from '@/components/input';
import { cn } from '@/components/utils';
import { type BasicBinding } from '@/domain/library';
import { globalIDs, PARAMETER } from '@/utils/constants';
import { truncateToLastWord } from '@/utils/format';
import { TextMatcher } from '@/utils/utils';

const VALUE_TRUNCATE = 40;

interface PickElementProps {
  className?: string;

  alias: string;
  term: string;
  binding: BasicBinding | null;
  isInteger?: boolean;

  value: number | null;
  onChange: (value: number) => void;
}

const columnHelper = createColumnHelper<number>();

export function PickElement({ className, value, alias, isInteger, term, binding, onChange }: PickElementProps) {
  const [filter, setFilter] = useState('');
  const [filterDebounced] = useDebounce(filter, PARAMETER.searchDebounce);
  const labelText = term ? `${alias}: ${term}` : alias || 'N/A';
  const matcher = new TextMatcher(filterDebounced);

  const filteredIDs = !binding
    ? []
    : Object.entries(binding)
        .filter(entry => matcher.test(entry[1]))
        .map(entry => Number(entry[0]))
        .filter(id => id !== value);
  const filtered = [...(value === null ? [] : [value]), ...filteredIDs];

  const columns = [
    columnHelper.accessor(id => id, {
      id: 'elem_id',
      header: () => <div className='w-4 pl-1'>ID</div>,
      size: 40,
      minSize: 40,
      maxSize: 40,
      cell: props => <div className='w-full text-center'>{props.getValue()}</div>
    }),
    columnHelper.accessor(id => id, {
      id: 'elem_text',
      header: 'Текст',
      size: 180,
      minSize: 180,
      maxSize: 180,
      cell: props => <TextCell text={prepareText(props.getValue(), binding)} />
    })
  ];

  const conditionalRowStyles: IConditionalStyle<number>[] = [
    {
      when: (id: number) => id === value,
      className: 'bg-selected'
    }
  ];

  if (isInteger) {
    return (
      <TextInput
        label='Укажите значение'
        type='number'
        inputMode='numeric'
        step='1'
        className={className}
        value={value ?? ''}
        onChange={event => {
          const strVal = event.target.value;
          if (/^-?\d*$/.test(strVal)) {
            // allow negative and positive integers, no decimals
            onChange(strVal === '' ? -1 : Number(strVal));
          }
        }}
      />
    );
  }

  if (!binding) {
    return <div className={cn('text-muted-foreground', className)}>Выберите элемент для редактирования</div>;
  }

  return (
    <div className={cn('flex flex-col h-fit', className)}>
      <div className='truncate select-none mb-2' data-tooltip-id={globalIDs.tooltip} data-tooltip-content={labelText}>
        {labelText}
      </div>
      <SearchBar
        id='dlg_elements_search'
        noBorder
        className='-my-0.75 -ml-1 w-45'
        query={filter}
        onChangeQuery={setFilter}
      />
      <DataTable
        columns={columns}
        data={filtered}
        dense
        headPosition='0rem'
        enablePagination
        paginationPerPage={15}
        paginationOptions={[15]}
        noFooter
        className='text-sm cc-scroll-y border h-120'
        conditionalRowStyles={conditionalRowStyles}
        onRowClicked={(id: number) => onChange(id)}
      />
    </div>
  );
}

// ===== Internals =====
function prepareText(id: number, binding: BasicBinding | null): string {
  if (binding && String(id) in binding) {
    return binding[id];
  } else {
    return 'N/A';
  }
}

function TextCell({ text }: { text: string }) {
  const needsTooltip = text.length > VALUE_TRUNCATE;
  return (
    <div
      className='w-43'
      data-tooltip-content={needsTooltip ? text : undefined}
      data-tooltip-id={needsTooltip ? globalIDs.tooltip : undefined}
    >
      {truncateToLastWord(text, VALUE_TRUNCATE)}
    </div>
  );
}

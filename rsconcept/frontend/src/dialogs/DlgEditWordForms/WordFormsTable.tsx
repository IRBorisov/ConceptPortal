'use client';

import clsx from 'clsx';
import { useCallback, useMemo } from 'react';

import { IconRemove } from '@/components/Icons';
import WordFormBadge from '@/components/info/WordFormBadge';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import MiniButton from '@/components/ui/MiniButton';
import { IWordForm } from '@/models/language';

interface WordFormsTableProps {
  forms: IWordForm[];
  setForms: React.Dispatch<React.SetStateAction<IWordForm[]>>;
  onFormSelect?: (form: IWordForm) => void;
}

const columnHelper = createColumnHelper<IWordForm>();

function WordFormsTable({ forms, setForms, onFormSelect }: WordFormsTableProps) {
  const handleDeleteRow = useCallback(
    (row: number) => {
      setForms(prev => {
        const newForms: IWordForm[] = [];
        prev.forEach((form, index) => {
          if (index !== row) {
            newForms.push(form);
          }
        });
        return newForms;
      });
    },
    [setForms]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('text', {
        id: 'text',
        size: 350,
        minSize: 500,
        maxSize: 500,
        cell: props => <div className='min-w-[20rem]'>{props.getValue()}</div>
      }),
      columnHelper.accessor('grams', {
        id: 'grams',
        maxSize: 150,
        cell: props => <WordFormBadge keyPrefix={props.cell.id} form={props.row.original} />
      }),
      columnHelper.display({
        id: 'actions',
        size: 50,
        minSize: 50,
        maxSize: 50,
        cell: props => (
          <div className='h-[1.25rem] w-[1.25rem]'>
            <MiniButton
              noHover
              noPadding
              title='Удалить словоформу'
              icon={<IconRemove size='1.25rem' className='icon-red' />}
              onClick={() => handleDeleteRow(props.row.index)}
            />
          </div>
        )
      })
    ],
    [handleDeleteRow]
  );

  return (
    <DataTable
      dense
      noFooter
      noHeader
      className={clsx('mb-2', 'max-h-[17.4rem] min-h-[17.4rem]', 'border', 'text-sm', 'cc-scroll-y')}
      data={forms}
      columns={columns}
      headPosition='0'
      noDataComponent={
        <span className='p-2 text-center min-h-[2rem]'>
          <p>Список пуст</p>
          <p>Добавьте словоформу</p>
        </span>
      }
      onRowClicked={onFormSelect}
    />
  );
}

export default WordFormsTable;

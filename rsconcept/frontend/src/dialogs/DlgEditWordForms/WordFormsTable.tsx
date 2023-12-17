'use client';

import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { BiX } from 'react-icons/bi';

import MiniButton from '@/components/Common/MiniButton';
import DataTable, { createColumnHelper } from '@/components/DataTable';
import WordFormBadge from '@/components/Shared/WordFormBadge';
import { IWordForm } from '@/models/language';

interface WordFormsTableProps {
  forms: IWordForm[]
  setForms: React.Dispatch<React.SetStateAction<IWordForm[]>>
  onFormSelect?: (form: IWordForm) => void
}

const columnHelper = createColumnHelper<IWordForm>();

function WordFormsTable({ forms, setForms, onFormSelect }: WordFormsTableProps) {
  const handleDeleteRow = useCallback(
  (row: number) => {
    setForms(
    (prev) => {
      const newForms: IWordForm[] = [];
      prev.forEach(
      (form, index) => {
        if (index !== row) {
          newForms.push(form);
        }
      });
      return newForms;
    });
  }, [setForms]);

  const columns = useMemo(
  () => [
    columnHelper.accessor('text', {
      id: 'text',
      header: 'Текст',
      size: 350,
      minSize: 350,
      maxSize: 350,
      cell: props => <div className='min-w-[20rem]'>{props.getValue()}</div>
    }),
    columnHelper.accessor('grams', {
      id: 'grams',
      header: 'Граммемы',
      size: 250,
      minSize: 250,
      maxSize: 250,
      cell: props =>
        <WordFormBadge
          keyPrefix={props.cell.id}
          form={props.row.original}
        />
    }),
    columnHelper.display({
      id: 'actions',
      size: 50,
      minSize: 50,
      maxSize: 50,
      cell: props => 
        <MiniButton noHover
          tooltip='Удалить словоформу'
          icon={<BiX size='1rem' className='clr-text-warning'/>}
          onClick={() => handleDeleteRow(props.row.index)}
        />
    })
  ], [handleDeleteRow]);
    
  return (
  <DataTable dense noFooter
    className={clsx(
      'mb-2',
      'max-h-[17.4rem] min-h-[17.4rem]',
      'border',
      'overflow-y-auto'
    )}
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
  />);
}

export default WordFormsTable;
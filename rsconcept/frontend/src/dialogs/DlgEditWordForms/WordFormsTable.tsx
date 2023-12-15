'use client';

import { useCallback, useMemo } from 'react';

import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import DataTable, { createColumnHelper } from '@/components/DataTable';
import { CrossIcon } from '@/components/Icons';
import WordFormBadge from '@/components/Shared/WordFormBadge';
import { IWordForm } from '@/models/language';

interface WordFormsTableProps {
  forms: IWordForm[]
  setForms: React.Dispatch<React.SetStateAction<IWordForm[]>>
  onFormSelect?: (form: IWordForm) => void
  loading?: boolean
}

const columnHelper = createColumnHelper<IWordForm>();

function WordFormsTable({ forms, setForms, onFormSelect, loading }: WordFormsTableProps) {
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

  function handleResetAll() {
    setForms([]);
  }

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
          icon={<CrossIcon size={4} color='text-warning'/>}
          onClick={() => handleDeleteRow(props.row.index)}
        />
    })
  ], [handleDeleteRow]);
    
  return (
  <>
    <Overlay position='top-1 right-4'>
    <MiniButton
        tooltip='Сбросить все словоформы'
        icon={<CrossIcon size={4} color={forms.length === 0 ? 'text-disabled' : 'text-warning'} />}
        disabled={loading || forms.length === 0}
        onClick={handleResetAll}
      />
    </Overlay>
    <DataTable dense noFooter
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
  </>);
}

export default WordFormsTable;
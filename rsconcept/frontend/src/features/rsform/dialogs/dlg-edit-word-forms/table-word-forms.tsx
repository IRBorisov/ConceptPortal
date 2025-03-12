'use client';

import { MiniButton } from '@/components/control1';
import { createColumnHelper, DataTable } from '@/components/data-table';
import { IconRemove } from '@/components/icons1';
import { NoData } from '@/components/view1';

import { BadgeWordForm } from '../../components/badge-word-form';
import { type IWordForm } from '../../models/language';

interface TableWordFormsProps {
  forms: IWordForm[];
  setForms: React.Dispatch<React.SetStateAction<IWordForm[]>>;
  onFormSelect?: (form: IWordForm) => void;
}

const columnHelper = createColumnHelper<IWordForm>();

export function TableWordForms({ forms, setForms, onFormSelect }: TableWordFormsProps) {
  function handleDeleteRow(row: number) {
    setForms(prev => {
      const newForms: IWordForm[] = [];
      prev.forEach((form, index) => {
        if (index !== row) {
          newForms.push(form);
        }
      });
      return newForms;
    });
  }

  const columns = [
    columnHelper.accessor('text', {
      id: 'text',
      size: 350,
      minSize: 500,
      maxSize: 500,
      cell: props => <div className='min-w-100'>{props.getValue()}</div>
    }),
    columnHelper.accessor('grams', {
      id: 'grams',
      size: 0,
      cell: props => <BadgeWordForm keyPrefix={props.cell.id} form={props.row.original} />
    }),
    columnHelper.display({
      id: 'actions',
      size: 0,
      cell: props => (
        <MiniButton
          noHover
          noPadding
          className='align-middle'
          title='Удалить словоформу'
          icon={<IconRemove size='1.25rem' className='icon-red' />}
          onClick={() => handleDeleteRow(props.row.index)}
        />
      )
    })
  ];

  return (
    <DataTable
      dense
      noFooter
      noHeader
      className='mb-2 max-h-70 min-h-70 border text-sm cc-scroll-y'
      data={forms}
      columns={columns}
      headPosition='0'
      noDataComponent={
        <NoData className='min-h-8'>
          <p>Список пуст</p>
          <p>Добавьте словоформу</p>
        </NoData>
      }
      onRowClicked={onFormSelect}
    />
  );
}

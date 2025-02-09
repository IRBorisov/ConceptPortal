'use client';

import clsx from 'clsx';

import { MiniButton } from '@/components/Control';
import DataTable, { createColumnHelper } from '@/components/DataTable';
import { IconRemove } from '@/components/Icons';
import { NoData } from '@/components/View';

import BadgeWordForm from '../../components/BadgeWordForm';
import { IWordForm } from '../../models/language';

interface TableWordFormsProps {
  forms: IWordForm[];
  setForms: React.Dispatch<React.SetStateAction<IWordForm[]>>;
  onFormSelect?: (form: IWordForm) => void;
}

const columnHelper = createColumnHelper<IWordForm>();

function TableWordForms({ forms, setForms, onFormSelect }: TableWordFormsProps) {
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
      cell: props => <div className='min-w-[25rem]'>{props.getValue()}</div>
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
  ];

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
        <NoData className='min-h-[2rem]'>
          <p>Список пуст</p>
          <p>Добавьте словоформу</p>
        </NoData>
      }
      onRowClicked={onFormSelect}
    />
  );
}

export default TableWordForms;

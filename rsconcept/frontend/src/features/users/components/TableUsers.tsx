'use client';

import { MiniButton } from '@/components/Control';
import { createColumnHelper, DataTable } from '@/components/DataTable';
import { IconRemove } from '@/components/Icons';

import { type IUserInfo } from '../backend/types';

interface TableUsersProps {
  items: IUserInfo[];
  onDelete: (target: number) => void;
}

const columnHelper = createColumnHelper<IUserInfo>();

export function TableUsers({ items, onDelete }: TableUsersProps) {
  const columns = [
    columnHelper.accessor('last_name', {
      id: 'last_name',
      size: 400,
      header: 'Фамилия'
    }),
    columnHelper.accessor('first_name', {
      id: 'first_name',
      size: 400,
      header: 'Имя'
    }),
    columnHelper.display({
      id: 'actions',
      size: 0,
      cell: props => (
        <div className='h-[1.25rem] w-[1.25rem]'>
          <MiniButton
            title='Удалить из списка'
            noHover
            noPadding
            icon={<IconRemove size='1.25rem' className='icon-red' />}
            onClick={() => onDelete(props.row.original.id)}
          />
        </div>
      )
    })
  ];

  return (
    <DataTable
      dense
      noFooter
      headPosition='0'
      className='mb-2 border cc-scroll-y'
      rows={6}
      data={items}
      columns={columns}
    />
  );
}

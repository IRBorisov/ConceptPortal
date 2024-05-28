'use client';

import { useMemo } from 'react';

import { IconRemove } from '@/components/Icons';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import MiniButton from '@/components/ui/MiniButton';
import { IUserInfo, UserID } from '@/models/user';

interface UsersTableProps {
  items: IUserInfo[];
  onDelete: (target: UserID) => void;
}

const columnHelper = createColumnHelper<IUserInfo>();

function UsersTable({ items, onDelete }: UsersTableProps) {
  const columns = useMemo(
    () => [
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
        size: 50,
        minSize: 50,
        maxSize: 50,
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
    ],
    [onDelete]
  );

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

export default UsersTable;

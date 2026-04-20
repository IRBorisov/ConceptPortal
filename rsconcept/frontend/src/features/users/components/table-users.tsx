import { MiniButton } from '@/components/control';
import { createColumnHelper, DataTable } from '@/components/data-table';
import { IconRemove, IconReset } from '@/components/icons';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';

import { type UserInfo } from '../backend/types';

interface TableUsersProps extends Styling {
  items: UserInfo[];
  onDelete: (target: number) => void;
  onReset: () => void;
}

const columnHelper = createColumnHelper<UserInfo>();

export function TableUsers({ items, onDelete, onReset, className, style }: TableUsersProps) {
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
        <MiniButton
          title='Удалить из списка'
          className='align-middle'
          noPadding
          icon={<IconRemove size='1.25rem' className='cc-remove' />}
          onClick={() => onDelete(props.row.original.id)}
        />
      )
    })
  ];

  return (
    <div className='relative'>
      {items.length > 0 ? (
        <MiniButton
          title='Очистить список'
          className='absolute z-pop top-2 right-1 py-0 align-middle'
          icon={<IconReset size='1.25rem' className='cc-remove' />}
          onClick={onReset}
          disabled={items.length === 0}
        />
      ) : null}
      <DataTable
        dense
        noFooter
        headPosition='0'
        className={cn('border cc-scroll-y', className)}
        style={style}
        rows={8}
        data={items}
        columns={columns}
      />
    </div>
  );
}

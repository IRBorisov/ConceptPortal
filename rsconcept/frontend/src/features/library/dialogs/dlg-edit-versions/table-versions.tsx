'use client';

import { useIntl } from 'react-intl';

import { MiniButton } from '@/components/control';
import { createColumnHelper, DataTable, type IConditionalStyle } from '@/components/data-table';
import { IconRemove } from '@/components/icons';
import { APP_COLORS } from '@/styling/colors';

import { type IVersionInfo } from '../../backend/types';

interface TableVersionsProps {
  processing: boolean;
  items: IVersionInfo[];
  selected?: number;
  onDelete: (versionID: number) => void;
  onSelect: (versionID: number) => void;
}

const columnHelper = createColumnHelper<IVersionInfo>();

export function TableVersions({ processing, items, onDelete, selected, onSelect }: TableVersionsProps) {
  const intl = useIntl();

  function handleDeleteVersion(event: React.MouseEvent, targetVersion: number) {
    event.preventDefault();
    event.stopPropagation();
    onDelete(targetVersion);
  }

  const columns = [
    columnHelper.accessor('version', {
      id: 'version',
      header: 'Версия',
      cell: props => <div className='w-24 text-ellipsis'>{props.getValue()}</div>
    }),
    columnHelper.accessor('description', {
      id: 'description',
      header: 'Описание',
      size: 800,
      minSize: 800,
      maxSize: 800,
      cell: props => <div className='text-ellipsis'>{props.getValue()}</div>
    }),
    columnHelper.accessor('time_create', {
      id: 'time_create',
      header: 'Дата создания',
      cell: props => (
        <div className='whitespace-nowrap'>
          {new Date(props.getValue()).toLocaleString(intl.locale, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )
    }),
    columnHelper.display({
      id: 'actions',
      size: 0,
      cell: props => (
        <MiniButton
          title='Удалить версию'
          className='align-middle'
          noHover
          noPadding
          icon={<IconRemove size='1.25rem' className='icon-red' />}
          onClick={event => handleDeleteVersion(event, props.row.original.id)}
          disabled={processing}
        />
      )
    })
  ];

  const conditionalRowStyles: IConditionalStyle<IVersionInfo>[] = [
    {
      when: (version: IVersionInfo) => version.id === selected,
      style: {
        backgroundColor: APP_COLORS.bgSelected
      }
    }
  ];

  return (
    <DataTable
      dense
      noFooter
      headPosition='0'
      className='mb-2 h-70 border cc-scroll-y'
      data={items}
      columns={columns}
      onRowClicked={rowData => onSelect(rowData.id)}
      conditionalRowStyles={conditionalRowStyles}
    />
  );
}

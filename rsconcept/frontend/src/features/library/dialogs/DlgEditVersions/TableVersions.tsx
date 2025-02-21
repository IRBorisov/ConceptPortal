'use client';

import { useIntl } from 'react-intl';
import clsx from 'clsx';

import { MiniButton } from '@/components/Control';
import { createColumnHelper, DataTable, type IConditionalStyle } from '@/components/DataTable';
import { IconRemove } from '@/components/Icons';
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
      cell: props => <div className='min-w-[6rem] max-w-[6rem] text-ellipsis'>{props.getValue()}</div>
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
        <div className='h-[1.25rem] w-[1.25rem]'>
          <MiniButton
            title='Удалить версию'
            noHover
            noPadding
            disabled={processing}
            icon={<IconRemove size='1.25rem' className='icon-red' />}
            onClick={event => handleDeleteVersion(event, props.row.original.id)}
          />
        </div>
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
      className={clsx('mb-2', 'max-h-[17.4rem] min-h-[17.4rem]', 'border', 'cc-scroll-y')}
      data={items}
      columns={columns}
      onRowClicked={rowData => onSelect(rowData.id)}
      conditionalRowStyles={conditionalRowStyles}
    />
  );
}

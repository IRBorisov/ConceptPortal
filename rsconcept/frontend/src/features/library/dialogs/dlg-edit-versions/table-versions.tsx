'use client';

import { useIntl } from 'react-intl';

import { type VersionInfo } from '@/domain/library';
import { useTx } from '@/i18n';

import { MiniButton } from '@/components/control';
import { createColumnHelper, DataTable, type IConditionalStyle } from '@/components/data-table';
import { IconRemove } from '@/components/icons';

interface TableVersionsProps {
  processing: boolean;
  items: VersionInfo[];
  selected?: number;
  onDelete: (versionID: number) => void;
  onSelect: (versionID: number) => void;
}

const columnHelper = createColumnHelper<VersionInfo>();

export function TableVersions({ processing, items, onDelete, selected, onSelect }: TableVersionsProps) {
  const tx = useTx();
  const intl = useIntl();

  function handleDeleteVersion(event: React.MouseEvent, targetVersion: number) {
    event.preventDefault();
    event.stopPropagation();
    onDelete(targetVersion);
  }

  const columns = [
    columnHelper.accessor('version', {
      id: 'version',
      header: () => <span className='min-w-24'>{tx('tx.lib.version')}</span>,
      cell: props => <div className='text-ellipsis'>{props.getValue()}</div>
    }),
    columnHelper.accessor('description', {
      id: 'description',
      header: tx('tx.lib.description'),
      size: 800,
      minSize: 800,
      maxSize: 800,
      cell: props => <div className='text-ellipsis'>{props.getValue()}</div>
    }),
    columnHelper.accessor('time_create', {
      id: 'time_create',
      header: () => <span className='min-w-26'>{tx('tx.general.date.creation')}</span>,
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
          title={tx('tx.general.delete')}
          className='align-middle'
          noPadding
          icon={<IconRemove size='1.25rem' className='cc-remove' />}
          onClick={event => handleDeleteVersion(event, props.row.original.id)}
          disabled={processing}
        />
      )
    })
  ];

  const conditionalRowStyles: IConditionalStyle<VersionInfo>[] = [
    {
      when: (version: VersionInfo) => version.id === selected,
      className: 'bg-selected'
    }
  ];

  return (
    <DataTable
      dense
      noFooter
      className='mb-2 h-70 border cc-scroll-y'
      data={items}
      columns={columns}
      onRowClicked={rowData => onSelect(rowData.id)}
      conditionalRowStyles={conditionalRowStyles}
    />
  );
}

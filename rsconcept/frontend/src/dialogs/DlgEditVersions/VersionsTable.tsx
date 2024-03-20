'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import { BiX } from 'react-icons/bi';
import { useIntl } from 'react-intl';

import DataTable, { createColumnHelper, IConditionalStyle } from '@/components/ui/DataTable';
import MiniButton from '@/components/ui/MiniButton';
import { useConceptTheme } from '@/context/ThemeContext';
import { IVersionInfo } from '@/models/library';

interface VersionsTableProps {
  processing: boolean;
  items: IVersionInfo[];
  selected?: number;
  onDelete: (versionID: number) => void;
  onSelect: (versionID: number) => void;
}

const columnHelper = createColumnHelper<IVersionInfo>();

function VersionsTable({ processing, items, onDelete, selected, onSelect }: VersionsTableProps) {
  const intl = useIntl();
  const { colors } = useConceptTheme();

  const columns = useMemo(
    () => [
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
        size: 50,
        minSize: 50,
        maxSize: 50,
        cell: props => (
          <MiniButton
            noHover
            title='Удалить версию'
            disabled={processing}
            icon={<BiX size='1rem' className='icon-red' />}
            onClick={() => onDelete(props.row.original.id)}
          />
        )
      })
    ],
    [onDelete, intl, processing]
  );

  const conditionalRowStyles = useMemo(
    (): IConditionalStyle<IVersionInfo>[] => [
      {
        when: (version: IVersionInfo) => version.id === selected,
        style: {
          backgroundColor: colors.bgSelected
        }
      }
    ],
    [selected, colors]
  );

  return (
    <DataTable
      dense
      noFooter
      className={clsx('mb-2', 'max-h-[17.4rem] min-h-[17.4rem]', 'border', 'overflow-y-auto')}
      data={items}
      columns={columns}
      headPosition='0'
      onRowClicked={rowData => onSelect(rowData.id)}
      conditionalRowStyles={conditionalRowStyles}
    />
  );
}

export default VersionsTable;

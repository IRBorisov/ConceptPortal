'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { IconRemove } from '@/components/Icons';
import DataTable, { createColumnHelper, IConditionalStyle } from '@/components/ui/DataTable';
import MiniButton from '@/components/ui/MiniButton';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { IVersionInfo, VersionID } from '@/models/library';

interface TableVersionsProps {
  processing: boolean;
  items: IVersionInfo[];
  selected?: VersionID;
  onDelete: (versionID: VersionID) => void;
  onSelect: (versionID: VersionID) => void;
}

const columnHelper = createColumnHelper<IVersionInfo>();

function TableVersions({ processing, items, onDelete, selected, onSelect }: TableVersionsProps) {
  const intl = useIntl();
  const { colors } = useConceptOptions();

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
          <div className='h-[1.25rem] w-[1.25rem]'>
            <MiniButton
              title='Удалить версию'
              noHover
              noPadding
              disabled={processing}
              icon={<IconRemove size='1.25rem' className='icon-red' />}
              onClick={() => onDelete(props.row.original.id)}
            />
          </div>
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
      headPosition='0'
      className={clsx('mb-2', 'max-h-[17.4rem] min-h-[17.4rem]', 'border', 'cc-scroll-y')}
      data={items}
      columns={columns}
      onRowClicked={rowData => onSelect(rowData.id)}
      conditionalRowStyles={conditionalRowStyles}
    />
  );
}

export default TableVersions;

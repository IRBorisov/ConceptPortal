'use client';

import { useCallback, useMemo } from 'react';
import { BiChevronLeft, BiChevronRight, BiFirstPage, BiLastPage, BiX } from 'react-icons/bi';

import ConstituentaBadge from '@/components/info/ConstituentaBadge';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import MiniButton from '@/components/ui/MiniButton';
import { useConceptTheme } from '@/context/ThemeContext';
import { ISubstitution } from '@/models/rsform';
import { describeConstituenta } from '@/utils/labels';

interface SubstitutionsTableProps {
  prefixID: string;
  rows?: number;
  items: ISubstitution[];
  setItems: React.Dispatch<React.SetStateAction<ISubstitution[]>>;
}

function SubstitutionIcon({ item }: { item: ISubstitution }) {
  if (item.deleteRight) {
    if (item.takeLeftTerm) {
      return <BiChevronRight size='1.2rem' />;
    } else {
      return <BiLastPage size='1.2rem' />;
    }
  } else {
    if (item.takeLeftTerm) {
      return <BiFirstPage size='1.2rem' />;
    } else {
      return <BiChevronLeft size='1.2rem' />;
    }
  }
}

const columnHelper = createColumnHelper<ISubstitution>();

function SubstitutionsTable({ items, rows, setItems, prefixID }: SubstitutionsTableProps) {
  const { colors } = useConceptTheme();

  const handleDeleteRow = useCallback(
    (row: number) => {
      setItems(prev => {
        const newItems: ISubstitution[] = [];
        prev.forEach((item, index) => {
          if (index !== row) {
            newItems.push(item);
          }
        });
        return newItems;
      });
    },
    [setItems]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor(item => describeConstituenta(item.leftCst), {
        id: 'left_text',
        header: 'Описание',
        size: 1000,
        cell: props => <div className='text-xs text-ellipsis'>{props.getValue()}</div>
      }),
      columnHelper.accessor(item => item.leftCst.alias, {
        id: 'left_alias',
        header: 'Имя',
        size: 65,
        cell: props => (
          <ConstituentaBadge theme={colors} value={props.row.original.leftCst} prefixID={`${prefixID}_1_`} />
        )
      }),
      columnHelper.display({
        id: 'status',
        header: '',
        size: 40,
        cell: props => <SubstitutionIcon item={props.row.original} />
      }),
      columnHelper.accessor(item => item.rightCst.alias, {
        id: 'right_alias',
        header: 'Имя',
        size: 65,
        cell: props => (
          <ConstituentaBadge theme={colors} value={props.row.original.rightCst} prefixID={`${prefixID}_2_`} />
        )
      }),
      columnHelper.accessor(item => describeConstituenta(item.rightCst), {
        id: 'right_text',
        header: 'Описание',
        size: 1000,
        cell: props => <div className='text-xs text-ellipsis'>{props.getValue()}</div>
      }),
      columnHelper.display({
        id: 'actions',
        size: 50,
        minSize: 50,
        maxSize: 50,
        cell: props => (
          <MiniButton
            noHover
            title='Удалить'
            icon={<BiX size='1rem' className='icon-red' />}
            onClick={() => handleDeleteRow(props.row.index)}
          />
        )
      })
    ],
    [handleDeleteRow, colors, prefixID]
  );

  return (
    <DataTable
      dense
      noFooter
      className='mb-2 overflow-y-auto border select-none'
      rows={rows}
      contentHeight='1.3rem'
      data={items}
      columns={columns}
      headPosition='0'
      noDataComponent={
        <span className='p-2 text-center min-h-[2rem]'>
          <p>Список пуст</p>
          <p>Добавьте отождествление</p>
        </span>
      }
    />
  );
}

export default SubstitutionsTable;

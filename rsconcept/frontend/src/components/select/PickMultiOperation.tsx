'use client';

import { useCallback, useMemo, useState } from 'react';

import { IconMoveDown, IconMoveUp, IconRemove } from '@/components/Icons';
import SelectOperation from '@/components/select/SelectOperation';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import MiniButton from '@/components/ui/MiniButton';
import NoData from '@/components/ui/NoData';
import { IOperation, OperationID } from '@/models/oss';

interface PickMultiOperationProps {
  rows?: number;

  items: IOperation[];
  selected: OperationID[];
  setSelected: React.Dispatch<React.SetStateAction<OperationID[]>>;
}

const columnHelper = createColumnHelper<IOperation>();

function PickMultiOperation({ rows, items, selected, setSelected }: PickMultiOperationProps) {
  const selectedItems = useMemo(
    () => selected.map(itemID => items.find(item => item.id === itemID)!),
    [items, selected]
  );
  const nonSelectedItems = useMemo(() => items.filter(item => !selected.includes(item.id)), [items, selected]);
  const [lastSelected, setLastSelected] = useState<IOperation | undefined>(undefined);

  const handleDelete = useCallback(
    (operation: OperationID) => setSelected(prev => prev.filter(item => item !== operation)),
    [setSelected]
  );

  const handleSelect = useCallback(
    (operation?: IOperation) => {
      if (operation) {
        setLastSelected(operation);
        setSelected(prev => [...prev, operation.id]);
        setTimeout(() => setLastSelected(undefined), 1000);
      }
    },
    [setSelected]
  );

  const handleMoveUp = useCallback(
    (operation: OperationID) => {
      const index = selected.indexOf(operation);
      if (index > 0) {
        setSelected(prev => {
          const newSelected = [...prev];
          newSelected[index] = newSelected[index - 1];
          newSelected[index - 1] = operation;
          return newSelected;
        });
      }
    },
    [setSelected, selected]
  );

  const handleMoveDown = useCallback(
    (operation: OperationID) => {
      const index = selected.indexOf(operation);
      if (index < selected.length - 1) {
        setSelected(prev => {
          const newSelected = [...prev];
          newSelected[index] = newSelected[index + 1];
          newSelected[index + 1] = operation;
          return newSelected;
        });
      }
    },
    [setSelected, selected]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('alias', {
        id: 'alias',
        header: 'Шифр',
        size: 300,
        minSize: 150,
        maxSize: 300
      }),
      columnHelper.accessor('title', {
        id: 'title',
        header: 'Название',
        size: 1200,
        minSize: 300,
        maxSize: 1200,
        cell: props => <div className='text-ellipsis'>{props.getValue()}</div>
      }),
      columnHelper.display({
        id: 'actions',
        size: 0,
        cell: props => (
          <div className='flex gap-1 w-fit'>
            <MiniButton
              noHover
              className='px-0'
              title='Удалить'
              icon={<IconRemove size='1rem' className='icon-red' />}
              onClick={() => handleDelete(props.row.original.id)}
            />
            <MiniButton
              noHover
              className='px-0'
              title='Выше'
              icon={<IconMoveUp size='1rem' className='icon-primary' />}
              onClick={() => handleMoveUp(props.row.original.id)}
            />
            <MiniButton
              noHover
              title='Ниже'
              className='px-0'
              icon={<IconMoveDown size='1rem' className='icon-primary' />}
              onClick={() => handleMoveDown(props.row.original.id)}
            />
          </div>
        )
      })
    ],
    [handleDelete, handleMoveUp, handleMoveDown]
  );

  return (
    <div className='flex flex-col gap-1 border-t border-x rounded-t-md clr-input'>
      <SelectOperation
        noBorder
        items={nonSelectedItems} // prettier: split-line
        value={lastSelected}
        onSelectValue={handleSelect}
      />
      <DataTable
        dense
        noFooter
        rows={rows}
        contentHeight='1.3rem'
        className='cc-scroll-y text-sm select-none border-y'
        data={selectedItems}
        columns={columns}
        headPosition='0rem'
        noDataComponent={
          <NoData>
            <p>Список пуст</p>
          </NoData>
        }
      />
    </div>
  );
}

export default PickMultiOperation;

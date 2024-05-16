'use client';

import { useCallback, useMemo, useState } from 'react';

import BadgeConstituenta from '@/components/info/BadgeConstituenta';
import SelectConstituenta from '@/components/select/SelectConstituenta';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import { useConceptOptions } from '@/context/OptionsContext';
import { IConstituenta, IRSForm, ISubstitution } from '@/models/rsform';
import { describeConstituenta } from '@/utils/labels';

import {
  IconKeepAliasOff,
  IconKeepAliasOn,
  IconKeepTermOff,
  IconKeepTermOn,
  IconPageFirst,
  IconPageLast,
  IconPageLeft,
  IconPageRight,
  IconRemove,
  IconReplace
} from '../Icons';

interface PickSubstitutionsProps {
  prefixID: string;
  rows?: number;

  schema1?: IRSForm;
  schema2?: IRSForm;
  filter1?: (cst: IConstituenta) => boolean;
  filter2?: (cst: IConstituenta) => boolean;

  items: ISubstitution[];
  setItems: React.Dispatch<React.SetStateAction<ISubstitution[]>>;
}

function SubstitutionIcon({ item }: { item: ISubstitution }) {
  if (item.deleteRight) {
    if (item.takeLeftTerm) {
      return <IconPageRight size='1.2rem' />;
    } else {
      return <IconPageLast size='1.2rem' />;
    }
  } else {
    if (item.takeLeftTerm) {
      return <IconPageFirst size='1.2rem' />;
    } else {
      return <IconPageLeft size='1.2rem' />;
    }
  }
}

const columnHelper = createColumnHelper<ISubstitution>();

function PickSubstitutions({
  items,
  schema1,
  schema2,
  filter1,
  filter2,
  rows,
  setItems,
  prefixID
}: PickSubstitutionsProps) {
  const { colors } = useConceptOptions();

  const [leftCst, setLeftCst] = useState<IConstituenta | undefined>(undefined);
  const [rightCst, setRightCst] = useState<IConstituenta | undefined>(undefined);
  const [deleteRight, setDeleteRight] = useState(true);
  const [takeLeftTerm, setTakeLeftTerm] = useState(true);

  const toggleDelete = () => setDeleteRight(prev => !prev);
  const toggleTerm = () => setTakeLeftTerm(prev => !prev);

  function addSubstitution() {
    if (!leftCst || !rightCst) {
      return;
    }
    const newSubstitution: ISubstitution = {
      leftCst: leftCst,
      rightCst: rightCst,
      deleteRight: deleteRight,
      takeLeftTerm: takeLeftTerm
    };
    setItems([
      newSubstitution,
      ...items.filter(
        item =>
          (!item.deleteRight && item.leftCst.id !== leftCst.id) ||
          (item.deleteRight && item.rightCst.id !== rightCst.id)
      )
    ]);
  }

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
          <BadgeConstituenta theme={colors} value={props.row.original.leftCst} prefixID={`${prefixID}_1_`} />
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
          <BadgeConstituenta theme={colors} value={props.row.original.rightCst} prefixID={`${prefixID}_2_`} />
        )
      }),
      columnHelper.accessor(item => describeConstituenta(item.rightCst), {
        id: 'right_text',
        header: 'Описание',
        minSize: 1000,
        cell: props => <div className='text-xs text-ellipsis text-pretty'>{props.getValue()}</div>
      }),
      columnHelper.display({
        id: 'actions',
        cell: props => (
          <MiniButton
            noHover
            title='Удалить'
            icon={<IconRemove size='1rem' className='icon-red' />}
            onClick={() => handleDeleteRow(props.row.index)}
          />
        )
      })
    ],
    [handleDeleteRow, colors, prefixID]
  );

  return (
    <div className='flex flex-col w-full'>
      <div className='flex items-end gap-3 justify-stretch'>
        <div className='flex-grow basis-1/2'>
          <div className='flex items-center justify-between'>
            <Label text={schema1 !== schema2 ? schema1?.alias ?? 'Схема 1' : ''} />
            <div className='cc-icons'>
              <MiniButton
                title='Сохранить конституенту'
                noHover
                onClick={toggleDelete}
                icon={
                  deleteRight ? (
                    <IconKeepAliasOn size='1rem' className='clr-text-green' />
                  ) : (
                    <IconKeepAliasOff size='1rem' className='clr-text-red' />
                  )
                }
              />
              <MiniButton
                title='Сохранить термин'
                noHover
                onClick={toggleTerm}
                icon={
                  takeLeftTerm ? (
                    <IconKeepTermOn size='1rem' className='clr-text-green' />
                  ) : (
                    <IconKeepTermOff size='1rem' className='clr-text-red' />
                  )
                }
              />
            </div>
          </div>
          <SelectConstituenta
            items={schema1?.items.filter(cst => !filter1 || filter1(cst))}
            value={leftCst}
            onSelectValue={setLeftCst}
          />
        </div>

        <MiniButton
          noHover
          title='Добавить в таблицу отождествлений'
          className='mb-[0.375rem] grow-0'
          icon={<IconReplace size='1.5rem' className='icon-primary' />}
          disabled={!leftCst || !rightCst || leftCst === rightCst}
          onClick={addSubstitution}
        />

        <div className='flex-grow basis-1/2'>
          <div className='flex items-center justify-between'>
            <Label text={schema1 !== schema2 ? schema2?.alias ?? 'Схема 2' : ''} />
            <div className='cc-icons'>
              <MiniButton
                title='Сохранить конституенту'
                noHover
                onClick={toggleDelete}
                icon={
                  !deleteRight ? (
                    <IconKeepAliasOn size='1rem' className='clr-text-green' />
                  ) : (
                    <IconKeepAliasOff size='1rem' className='clr-text-red' />
                  )
                }
              />
              <MiniButton
                title='Сохранить термин'
                noHover
                onClick={toggleTerm}
                icon={
                  !takeLeftTerm ? (
                    <IconKeepTermOn size='1rem' className='clr-text-green' />
                  ) : (
                    <IconKeepTermOff size='1rem' className='clr-text-red' />
                  )
                }
              />
            </div>
          </div>
          <SelectConstituenta
            items={schema2?.items.filter(cst => !filter2 || filter2(cst))}
            value={rightCst}
            onSelectValue={setRightCst}
          />
        </div>
      </div>

      <DataTable
        dense
        noHeader
        noFooter
        className='w-full text-sm border select-none cc-scroll-y'
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
    </div>
  );
}

export default PickSubstitutions;

'use client';

import { useCallback, useMemo, useState } from 'react';

import BadgeConstituenta from '@/components/info/BadgeConstituenta';
import SelectConstituenta from '@/components/select/SelectConstituenta';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import MiniButton from '@/components/ui/MiniButton';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { LibraryItemID } from '@/models/library';
import { ICstSubstitute, IMultiSubstitution, IOperation } from '@/models/oss';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';

import {
  IconKeepAliasOff,
  IconKeepAliasOn,
  IconKeepTermOff,
  IconKeepTermOn,
  IconPageLast,
  IconPageRight,
  IconRemove,
  IconReplace
} from '../Icons';
import NoData from '../ui/NoData';
import SelectOperation from './SelectOperation';

function SubstitutionIcon({ item, className }: { item: IMultiSubstitution; className?: string }) {
  if (!item.transfer_term) {
    return <IconPageRight size='1.2rem' className={className} />;
  } else {
    return <IconPageLast size='1.2rem' className={className} />;
  }
}

interface PickSubstitutionsProps {
  prefixID: string;
  rows?: number;

  operations: IOperation[];
  getSchema: (id: LibraryItemID) => IRSForm | undefined;
  getConstituenta: (id: ConstituentaID) => IConstituenta | undefined;
  getSchemaByCst: (id: ConstituentaID) => IRSForm | undefined;
  substitutions: ICstSubstitute[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ICstSubstitute[]>>;
}

const columnHelper = createColumnHelper<IMultiSubstitution>();

function PickSubstitutions({
  prefixID,
  rows,
  operations,
  getSchema,
  getConstituenta,
  getSchemaByCst,
  substitutions,
  setSubstitutions
}: PickSubstitutionsProps) {
  const { colors } = useConceptOptions();

  const [leftArgument, setLeftArgument] = useState<IOperation | undefined>(undefined);
  const [rightArgument, setRightArgument] = useState<IOperation | undefined>(undefined);
  const leftSchema = useMemo(
    () => (leftArgument?.result ? getSchema(leftArgument.result) : undefined),
    [leftArgument, getSchema]
  );

  const rightSchema = useMemo(
    () => (rightArgument?.result ? getSchema(rightArgument.result) : undefined),
    [rightArgument, getSchema]
  );
  const [leftCst, setLeftCst] = useState<IConstituenta | undefined>(undefined);
  const [rightCst, setRightCst] = useState<IConstituenta | undefined>(undefined);

  const [deleteRight, setDeleteRight] = useState(true);
  const [takeLeftTerm, setTakeLeftTerm] = useState(true);

  const operationByConstituenta = useCallback(
    (cst: ConstituentaID): IOperation | undefined => {
      const schema = getSchemaByCst(cst);
      if (!schema) {
        return undefined;
      }
      const cstOperations = operations.filter(item => item.result === schema.id);
      return cstOperations.length === 1 ? cstOperations[0] : undefined;
    },
    [getSchemaByCst, operations]
  );

  const substitutionData: IMultiSubstitution[] = useMemo(
    () =>
      substitutions.map(item => ({
        original_operation: operationByConstituenta(item.original),
        original: getConstituenta(item.original),
        substitution: getConstituenta(item.substitution),
        substitution_operation: operationByConstituenta(item.substitution),
        transfer_term: item.transfer_term
      })),
    [getConstituenta, operationByConstituenta, substitutions]
  );

  const toggleDelete = () => setDeleteRight(prev => !prev);
  const toggleTerm = () => setTakeLeftTerm(prev => !prev);

  function addSubstitution() {
    if (!leftCst || !rightCst) {
      return;
    }
    const newSubstitution: ICstSubstitute = {
      original: deleteRight ? rightCst.id : leftCst.id,
      substitution: deleteRight ? leftCst.id : rightCst.id,
      transfer_term: deleteRight != takeLeftTerm
    };
    setSubstitutions(prev => [...prev, newSubstitution]);
    setLeftCst(undefined);
    setRightCst(undefined);
  }

  const handleDeleteRow = useCallback(
    (row: number) => {
      setSubstitutions(prev => {
        const newItems: ICstSubstitute[] = [];
        prev.forEach((item, index) => {
          if (index !== row) {
            newItems.push(item);
          }
        });
        return newItems;
      });
    },
    [setSubstitutions]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor(item => item.substitution_operation?.alias ?? 'N/A', {
        id: 'left_schema',
        header: 'Операция',
        size: 100,
        cell: props => <div className='min-w-[10rem] text-ellipsis text-right'>{props.getValue()}</div>
      }),
      columnHelper.accessor(item => item.substitution?.alias ?? 'N/A', {
        id: 'left_alias',
        header: () => <span className='pl-3'>Имя</span>,
        size: 65,
        cell: props =>
          props.row.original.substitution ? (
            <BadgeConstituenta theme={colors} value={props.row.original.substitution} prefixID={`${prefixID}_1_`} />
          ) : (
            'N/A'
          )
      }),
      columnHelper.display({
        id: 'status',
        header: '',
        size: 40,
        cell: props => <SubstitutionIcon item={props.row.original} />
      }),
      columnHelper.accessor(item => item.original?.alias ?? 'N/A', {
        id: 'right_alias',
        header: () => <span className='pl-3'>Имя</span>,
        size: 65,
        cell: props =>
          props.row.original.original ? (
            <BadgeConstituenta theme={colors} value={props.row.original.original} prefixID={`${prefixID}_1_`} />
          ) : (
            'N/A'
          )
      }),
      columnHelper.accessor(item => item.original_operation?.alias ?? 'N/A', {
        id: 'right_schema',
        header: 'Операция',
        size: 100,
        cell: props => <div className='min-w-[8rem] text-ellipsis'>{props.getValue()}</div>
      }),
      columnHelper.display({
        id: 'actions',
        cell: props => (
          <div className='max-w-fit'>
            <MiniButton
              noHover
              title='Удалить'
              icon={<IconRemove size='1rem' className='icon-red' />}
              onClick={() => handleDeleteRow(props.row.index)}
            />
          </div>
        )
      })
    ],
    [handleDeleteRow, colors, prefixID]
  );

  return (
    <div className='flex flex-col w-full'>
      <div className='flex items-end gap-3 justify-stretch'>
        <div className='flex-grow flex flex-col basis-1/2'>
          <div className='cc-icons mb-1 w-fit mx-auto'>
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
          <div className='flex flex-col gap-[0.125rem] border-x border-t clr-input'>
            <SelectOperation
              noBorder
              items={operations.filter(item => item.id !== rightArgument?.id)}
              value={leftArgument}
              onSelectValue={setLeftArgument}
            />
            <SelectConstituenta
              noBorder
              items={leftSchema?.items.filter(cst => !substitutions.find(item => item.original === cst.id))}
              value={leftCst}
              onSelectValue={setLeftCst}
            />
          </div>
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
          <div className='cc-icons mb-1 w-fit mx-auto'>
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
          <div className='flex flex-col gap-[0.125rem] border-x border-t clr-input'>
            <SelectOperation
              noBorder
              items={operations.filter(item => item.id !== leftArgument?.id)}
              value={rightArgument}
              onSelectValue={setRightArgument}
            />
            <SelectConstituenta
              noBorder
              items={rightSchema?.items.filter(cst => !substitutions.find(item => item.original === cst.id))}
              value={rightCst}
              onSelectValue={setRightCst}
            />
          </div>
        </div>
      </div>

      <DataTable
        dense
        noHeader
        noFooter
        className='w-full text-sm border select-none cc-scroll-y'
        rows={rows}
        contentHeight='1.3rem'
        data={substitutionData}
        columns={columns}
        headPosition='0'
        noDataComponent={
          <NoData className='min-h-[2rem]'>
            <p>Список пуст</p>
            <p>Добавьте отождествление</p>
          </NoData>
        }
      />
    </div>
  );
}

export default PickSubstitutions;

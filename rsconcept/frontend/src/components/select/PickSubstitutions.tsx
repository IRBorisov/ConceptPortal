'use client';

import { useCallback, useMemo, useState } from 'react';

import BadgeConstituenta from '@/components/info/BadgeConstituenta';
import SelectConstituenta from '@/components/select/SelectConstituenta';
import DataTable, { createColumnHelper } from '@/components/ui/DataTable';
import MiniButton from '@/components/ui/MiniButton';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { ILibraryItem } from '@/models/library';
import { ICstSubstitute, IMultiSubstitution } from '@/models/oss';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';

import { IconPageLeft, IconPageRight, IconRemove, IconReplace } from '../Icons';
import NoData from '../ui/NoData';
import SelectLibraryItem from './SelectLibraryItem';

interface PickSubstitutionsProps {
  substitutions: ICstSubstitute[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ICstSubstitute[]>>;

  prefixID: string;
  rows?: number;
  allowSelfSubstitution?: boolean;

  schemas: IRSForm[];
  filter?: (cst: IConstituenta) => boolean;
}

const columnHelper = createColumnHelper<IMultiSubstitution>();

function PickSubstitutions({
  substitutions,
  setSubstitutions,
  prefixID,
  rows,
  schemas,
  filter,
  allowSelfSubstitution
}: PickSubstitutionsProps) {
  const { colors } = useConceptOptions();

  const [leftArgument, setLeftArgument] = useState<ILibraryItem | undefined>(
    schemas.length === 1 ? schemas[0] : undefined
  );
  const [rightArgument, setRightArgument] = useState<ILibraryItem | undefined>(
    schemas.length === 1 && allowSelfSubstitution ? schemas[0] : undefined
  );

  const [leftCst, setLeftCst] = useState<IConstituenta | undefined>(undefined);
  const [rightCst, setRightCst] = useState<IConstituenta | undefined>(undefined);

  const [deleteRight, setDeleteRight] = useState(true);
  const toggleDelete = () => setDeleteRight(prev => !prev);

  const getSchemaByCst = useCallback(
    (id: ConstituentaID): IRSForm | undefined => {
      for (const schema of schemas) {
        const cst = schema.cstByID.get(id);
        if (cst) {
          return schema;
        }
      }
      return undefined;
    },
    [schemas]
  );

  const getConstituenta = useCallback(
    (id: ConstituentaID): IConstituenta | undefined => {
      for (const schema of schemas) {
        const cst = schema.cstByID.get(id);
        if (cst) {
          return cst;
        }
      }
      return undefined;
    },
    [schemas]
  );

  const substitutionData: IMultiSubstitution[] = useMemo(
    () =>
      substitutions.map(item => ({
        original_source: getSchemaByCst(item.original),
        original: getConstituenta(item.original),
        substitution: getConstituenta(item.substitution),
        substitution_source: getSchemaByCst(item.substitution)
      })),
    [getConstituenta, getSchemaByCst, substitutions]
  );

  function addSubstitution() {
    if (!leftCst || !rightCst) {
      return;
    }
    const newSubstitution: ICstSubstitute = {
      original: deleteRight ? rightCst.id : leftCst.id,
      substitution: deleteRight ? leftCst.id : rightCst.id
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
      columnHelper.accessor(item => item.substitution_source?.alias ?? 'N/A', {
        id: 'left_schema',
        header: 'Операция',
        size: 100,
        cell: props => <div className='min-w-[10.5rem] text-ellipsis text-right'>{props.getValue()}</div>
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
        cell: () => <IconPageRight size='1.2rem' />
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
      columnHelper.accessor(item => item.original_source?.alias ?? 'N/A', {
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
          <div className='flex flex-col gap-[0.125rem] border-x border-t clr-input'>
            <SelectLibraryItem
              noBorder
              placeholder='Выберите аргумент'
              items={allowSelfSubstitution ? schemas : schemas.filter(item => item.id !== rightArgument?.id)}
              value={leftArgument}
              onSelectValue={setLeftArgument}
            />
            <SelectConstituenta
              noBorder
              items={(leftArgument as IRSForm)?.items.filter(
                cst => !substitutions.find(item => item.original === cst.id) && (!filter || filter(cst))
              )}
              value={leftCst}
              onSelectValue={setLeftCst}
            />
          </div>
        </div>
        <div className='flex flex-col gap-1'>
          <MiniButton
            title={deleteRight ? 'Заменить правую' : 'Заменить левую'}
            onClick={toggleDelete}
            icon={
              deleteRight ? (
                <IconPageRight size='1.5rem' className='clr-text-primary' />
              ) : (
                <IconPageLeft size='1.5rem' className='clr-text-primary' />
              )
            }
          />

          <MiniButton
            title='Добавить в таблицу отождествлений'
            className='mb-[0.375rem] grow-0'
            icon={<IconReplace size='1.5rem' className='icon-primary' />}
            disabled={!leftCst || !rightCst || leftCst === rightCst}
            onClick={addSubstitution}
          />
        </div>

        <div className='flex-grow basis-1/2'>
          <div className='flex flex-col gap-[0.125rem] border-x border-t clr-input'>
            <SelectLibraryItem
              noBorder
              placeholder='Выберите аргумент'
              items={allowSelfSubstitution ? schemas : schemas.filter(item => item.id !== leftArgument?.id)}
              value={rightArgument}
              onSelectValue={setRightArgument}
            />
            <SelectConstituenta
              noBorder
              items={(rightArgument as IRSForm)?.items.filter(
                cst => !substitutions.find(item => item.original === cst.id) && (!filter || filter(cst))
              )}
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
